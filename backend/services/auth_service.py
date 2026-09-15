"""
Authentication & User Management Service for PortOptimizer.
"""
from datetime import datetime, timezone
from typing import Dict, Any, Optional
from fastapi import HTTPException, status
from bson import ObjectId
from ..database.database import get_database
from ..auth.security import hash_password, verify_password, create_access_token

def register_user(name: str, email: str, password: str, role: str = "supervisor") -> Dict[str, Any]:
    """
    Registers a new user in MongoDB users collection with secure bcrypt password hash.
    Enforces normalized email and duplicate email prevention.
    """
    clean_name = name.strip()
    clean_email = email.strip().lower()

    if len(clean_name) < 2:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Name must be at least 2 characters."
        )
    if len(password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 6 characters."
        )

    db = get_database()
    
    # Check duplicate email
    existing_user = db.users.find_one({"email": clean_email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists."
        )
    
    now_iso = datetime.now(timezone.utc).isoformat()
    hashed = hash_password(password)

    user_doc = {
        "name": clean_name,
        "email": clean_email,
        "password_hash": hashed,
        "role": role or "supervisor",
        "created_at": now_iso,
        "updated_at": now_iso
    }

    result = db.users.insert_one(user_doc)
    user_id = str(result.inserted_id)

    # Issue JWT token for immediate seamless onboarding
    token = create_access_token({
        "user_id": user_id,
        "email": clean_email,
        "name": clean_name,
        "role": user_doc["role"]
    })

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user_id,
            "name": clean_name,
            "email": clean_email,
            "role": user_doc["role"],
            "created_at": now_iso
        }
    }

def authenticate_user(email: str, password: str) -> Dict[str, Any]:
    """
    Authenticates user credentials against MongoDB users collection.
    Generates JWT on success, raises 401 on invalid credentials.
    """
    clean_email = email.strip().lower()
    db = get_database()

    user_doc = db.users.find_one({"email": clean_email})
    if not user_doc or not user_doc.get("password_hash"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    if not verify_password(password, user_doc["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    user_id = str(user_doc["_id"])
    name = user_doc.get("name", "Supervisor")
    role = user_doc.get("role", "supervisor")

    token = create_access_token({
        "user_id": user_id,
        "email": clean_email,
        "name": name,
        "role": role
    })

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user_id,
            "name": name,
            "email": clean_email,
            "role": role,
            "created_at": user_doc.get("created_at")
        }
    }
