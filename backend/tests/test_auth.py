"""
Automated unit & integration tests for PortOptimizer authentication & JWT security.
"""
import pytest
from backend.auth.security import hash_password, verify_password, create_access_token, decode_access_token
from backend.services.auth_service import register_user, authenticate_user
from backend.database.database import get_database

def test_password_hashing_and_verification():
    raw_pw = "PortSupervisor@2026"
    hashed = hash_password(raw_pw)
    assert hashed != raw_pw
    assert verify_password(raw_pw, hashed) is True
    assert verify_password("wrong_password", hashed) is False

def test_jwt_generation_and_decoding():
    payload = {
        "user_id": "usr_test_123",
        "email": "lead_supervisor@port.gov",
        "name": "Capt. Haddock",
        "role": "supervisor"
    }
    token = create_access_token(payload)
    assert isinstance(token, str)
    assert len(token) > 20

    decoded = decode_access_token(token)
    assert decoded is not None
    assert decoded["user_id"] == "usr_test_123"
    assert decoded["email"] == "lead_supervisor@port.gov"
    assert decoded["name"] == "Capt. Haddock"
    assert decoded["role"] == "supervisor"
    assert "exp" in decoded
