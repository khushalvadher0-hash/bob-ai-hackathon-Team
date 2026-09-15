"""
Authentication API endpoints for PortOptimizer.
"""
from fastapi import APIRouter, Depends, status
from ..models.user import UserCreate, UserLogin, TokenResponse, UserResponse
from ..services.auth_service import register_user, authenticate_user
from ..auth.dependencies import get_current_user

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/signup", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def signup(payload: UserCreate):
    """Register a new supervisor or operator user."""
    return register_user(
        name=payload.name,
        email=payload.email,
        password=payload.password,
        role=payload.role or "supervisor"
    )

@router.post("/login", response_model=TokenResponse)
def login(payload: UserLogin):
    """Authenticate with email and password to receive a JWT access token."""
    return authenticate_user(
        email=payload.email,
        password=payload.password
    )

@router.get("/me", response_model=UserResponse)
def get_me(current_user: dict = Depends(get_current_user)):
    """Retrieve details for the currently authenticated user session."""
    return current_user
