"""
FastAPI dependencies for JWT authentication and current user retrieval.
"""
from typing import Optional, Dict, Any
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from bson import ObjectId
from .security import decode_access_token
from ..database.database import get_database

security_scheme = HTTPBearer(auto_error=False)

def get_current_user(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme)) -> Dict[str, Any]:
    """
    Extracts Bearer token, validates signature/expiration, and resolves user.
    Throws 401 Unauthorized on invalid/missing token.
    """
    if not credentials or not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Please sign in.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    token = credentials.credentials
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session has expired or token is invalid. Please sign in again.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user_id = payload.get("user_id")
    email = payload.get("email")
    if not user_id or not email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Try fetching fresh user record from MongoDB if available
    try:
        db = get_database()
        user_doc = None
        if ObjectId.is_valid(user_id):
            user_doc = db.users.find_one({"_id": ObjectId(user_id)})
        if not user_doc:
            user_doc = db.users.find_one({"email": email})
        
        if user_doc:
            return {
                "id": str(user_doc["_id"]),
                "name": user_doc.get("name", "Supervisor"),
                "email": user_doc.get("email", email),
                "role": user_doc.get("role", "supervisor")
            }
    except Exception:
        # Fallback to payload data if DB temporarily unreachable
        pass

    return {
        "id": str(user_id),
        "name": payload.get("name", "Supervisor"),
        "email": email,
        "role": payload.get("role", "supervisor")
    }

def get_optional_current_user(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme)) -> Optional[Dict[str, Any]]:
    """Returns authenticated user if valid token supplied, else None."""
    if not credentials or not credentials.credentials:
        return None
    try:
        return get_current_user(credentials)
    except HTTPException:
        return None
