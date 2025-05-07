from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from pydantic import ValidationError

import models
import schemas
from database import get_db

# Security constants
SECRET_KEY = "replace_with_secure_secret_key_in_production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/users/token")

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create JWT token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(token: str, credentials_exception):
    """Verify JWT token and return user ID and role"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        user_role: str = payload.get("role")
        if user_id is None:
            raise credentials_exception
        token_data = schemas.TokenData(user_id=user_id, role=user_role)
        return token_data
    except JWTError:
        raise credentials_exception

async def get_current_user(
    token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)
):
    """Get current authenticated user"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    token_data = verify_token(token, credentials_exception)
    user = db.query(models.User).filter(models.User.id == token_data.user_id).first()
    if user is None:
        raise credentials_exception
    return user

async def get_current_active_user(current_user: models.User = Depends(get_current_user)):
    """Check if user is active"""
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

def get_admin_user(current_user: models.User = Depends(get_current_user)):
    """Check if user is an admin"""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions",
        )
    return current_user

def get_hmc_user(current_user: models.User = Depends(get_current_user)):
    """Check if user is an HMC member"""
    if current_user.role != "hmc" and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions. HMC role required.",
        )
    return current_user

def get_warden_user(current_user: models.User = Depends(get_current_user)):
    """Check if user is a warden"""
    warden_roles = ["warden_lohit_girls", "warden_lohit_boys", "warden_papum_boys", "warden_subhanshiri_boys"]
    if current_user.role not in warden_roles and current_user.role != "admin" and current_user.role != "hmc":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions. Warden role required.",
        )
    return current_user

def get_specific_warden_user(hostel: str, current_user: models.User = Depends(get_current_user)):
    """Check if user is a warden for a specific hostel"""
    warden_mapping = {
        "lohit_girls": "warden_lohit_girls",
        "lohit_boys": "warden_lohit_boys",
        "papum_boys": "warden_papum_boys",
        "subhanshiri_boys": "warden_subhanshiri_boys"
    }
    
    if current_user.role != warden_mapping.get(hostel) and current_user.role != "admin" and current_user.role != "hmc":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Insufficient permissions. Warden role for {hostel} required.",
        )
    return current_user

def get_maintenance_user(current_user: models.User = Depends(get_current_user)):
    """Check if user is a maintenance staff (plumber or electrician)"""
    if current_user.role not in ["plumber", "electrician"] and current_user.role != "admin" and current_user.role != "hmc":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions. Maintenance role required.",
        )
    return current_user

def get_mess_vendor_user(current_user: models.User = Depends(get_current_user)):
    """Check if user is a mess vendor"""
    if current_user.role != "mess_vendor" and current_user.role != "admin" and current_user.role != "hmc":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions. Mess vendor role required.",
        )
    return current_user

def get_staff_or_admin_user(current_user: models.User = Depends(get_current_user)):
    """Check if user is staff or admin"""
    staff_roles = ["admin", "hmc", "warden_lohit_girls", "warden_lohit_boys", 
                  "warden_papum_boys", "warden_subhanshiri_boys", 
                  "plumber", "electrician", "mess_vendor"]
    
    if current_user.role not in staff_roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions",
        )
    return current_user
