"""
Security module for password hashing and JWT token issuance/verification.
"""
import os
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any
import jwt
import bcrypt

# JWT configuration loaded securely from environment
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "port_optimizer_super_secret_jwt_key_2026_hackathon")
JWT_ALGORITHM = "HS256"
JWT_EXPIRE_MINUTES = int(os.getenv("JWT_EXPIRE_MINUTES", "1440"))  # Default 24 hours

def hash_password(password: str) -> str:
    """Returns secure bcrypt hash of raw password."""
    pw_bytes = password.encode('utf-8')
    # Bcrypt max length safety
    if len(pw_bytes) > 72:
        pw_bytes = pw_bytes[:72]
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pw_bytes, salt).decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies plain password against hashed password."""
    try:
        pw_bytes = plain_password.encode('utf-8')
        if len(pw_bytes) > 72:
            pw_bytes = pw_bytes[:72]
        return bcrypt.checkpw(pw_bytes, hashed_password.encode('utf-8'))
    except Exception:
        return False

def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """Generates signed JWT access token."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=JWT_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire, "iat": datetime.now(timezone.utc)})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str) -> Optional[Dict[str, Any]]:
    """Decodes and validates signed JWT token."""
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.PyJWTError:
        return None
