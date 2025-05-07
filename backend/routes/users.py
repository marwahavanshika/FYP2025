from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import List
import os
import json
from datetime import timedelta
import bcrypt

import models
import schemas
from database import get_db
from auth import (
    create_access_token,
    get_current_active_user,
    get_admin_user,
    get_hmc_user,
    get_warden_user,
    ACCESS_TOKEN_EXPIRE_MINUTES,
)

router = APIRouter()

# Helper functions
def get_password_hash(password: str) -> str:
    """Hash a password for storing."""
    salt = bcrypt.gensalt()
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed_password.decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a stored password against a provided password."""
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

def authenticate_user(db: Session, email: str, password: str):
    """Authenticate a user by email and password."""
    user = db.query(models.User).filter(models.User.email == email).first()
    if not user or not verify_password(password, user.hashed_password):
        return False
    return user

# Function to find an available room for a student
def assign_room_for_student(db: Session, student: models.User):
    """Find an available room for a student based on hostel"""
    if not student.hostel:
        return None, None

    # Load room data from JSON
    current_dir = os.path.dirname(os.path.abspath(__file__))
    base_dir = os.path.dirname(current_dir)
    json_path = os.path.join(base_dir, 'data', 'hostel_rooms.json')
    
    try:
        with open(json_path, 'r') as f:
            hostel_rooms = json.load(f)
    except FileNotFoundError:
        return None, None

    if student.hostel not in hostel_rooms:
        return None, None

    # Get all rooms for this hostel from database
    rooms = db.query(models.Room).filter(models.Room.hostel == student.hostel).all()
    
    # Check each room for available space
    for room in rooms:
        # Count current allocations
        allocations_count = db.query(models.RoomAllocation).filter(
            models.RoomAllocation.room_id == room.id,
            models.RoomAllocation.status == "current"
        ).count()
        
        # If room has space
        if allocations_count < room.capacity:
            # Find available bed number
            used_beds = db.query(models.RoomAllocation.bed_number).filter(
                models.RoomAllocation.room_id == room.id,
                models.RoomAllocation.status == "current"
            ).all()
            used_bed_numbers = [bed[0] for bed in used_beds]
            
            for bed_number in range(1, room.capacity + 1):
                if bed_number not in used_bed_numbers:
                    return room, bed_number
    
    return None, None

# Helper for hostel allocation
def allocate_hostel_for_student(student_type: str, db: Session):
    """
    Automatically assign hostel based on student type:
    - Girls: Lohit Girls Hostel
    - PhD Boys: Subhanshiri Boys Hostel
    - Remaining Boys: Lohit Boys or Papum Boys Hostel (based on availability)
    """
    if student_type == "female":
        return "lohit_girls"
    elif student_type == "phd_male":
        return "subhanshiri_boys"
    else:
        # Count students in each hostel
        lohit_count = db.query(models.User).filter(models.User.hostel == "lohit_boys").count()
        papum_count = db.query(models.User).filter(models.User.hostel == "papum_boys").count()
        
        # Assign to hostel with fewer students
        if lohit_count <= papum_count:
            return "lohit_boys"
        else:
            return "papum_boys"

# User Endpoints
@router.post("/users/token", response_model=schemas.Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """Login and get JWT token."""
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user.id), "role": user.role}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/users/login", response_model=schemas.Token)
async def login(user_data: schemas.UserLogin, db: Session = Depends(get_db)):
    """Login endpoint that accepts JSON."""
    user = authenticate_user(db, user_data.email, user_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user.id), "role": user.role}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/users/", response_model=schemas.UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    """Register a new user."""
    # Check if email already exists
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )
    
    # Create new user
    hashed_password = get_password_hash(user.password)
    db_user = models.User(
        email=user.email,
        full_name=user.full_name,
        phone_number=user.phone_number,
        hashed_password=hashed_password,
        role=user.role,
        hostel=user.hostel
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    # Automatically assign a room if it's a student with a hostel
    if db_user.role == "student" and db_user.hostel:
        room, bed_number = assign_room_for_student(db, db_user)
        if room and bed_number:
            # Create room allocation
            from datetime import datetime
            allocation = models.RoomAllocation(
                user_id=db_user.id,
                room_id=room.id,
                bed_number=bed_number,
                start_date=datetime.now(),
                status="current"
            )
            db.add(allocation)
            db.commit()
    
    return db_user

@router.get("/users/me", response_model=schemas.UserResponse)
async def get_user_me(current_user: models.User = Depends(get_current_active_user)):
    """Get current user information."""
    return current_user

@router.put("/users/me", response_model=schemas.UserResponse)
async def update_user_me(
    user_update: schemas.UserUpdate,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update current user information."""
    if user_update.email is not None:
        # Check if new email is already taken
        if user_update.email != current_user.email:
            existing_user = db.query(models.User).filter(models.User.email == user_update.email).first()
            if existing_user:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email already registered",
                )
        current_user.email = user_update.email
    
    if user_update.full_name is not None:
        current_user.full_name = user_update.full_name
    
    if user_update.phone_number is not None:
        current_user.phone_number = user_update.phone_number
    
    db.commit()
    db.refresh(current_user)
    
    return current_user

@router.put("/users/me/password")
async def change_password(
    password_update: schemas.UserUpdatePassword,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Change user password."""
    # Verify current password
    if not verify_password(password_update.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect current password",
        )
    
    # Update password
    hashed_password = get_password_hash(password_update.new_password)
    current_user.hashed_password = hashed_password
    
    db.commit()
    
    return {"message": "Password updated successfully"}

# HMC Endpoints
@router.put("/users/{user_id}/assign-warden", response_model=schemas.UserResponse)
async def assign_warden_role(
    user_id: int,
    hostel: str,
    current_user: models.User = Depends(get_hmc_user),
    db: Session = Depends(get_db)
):
    """Assign a user as a warden for a specific hostel (HMC only)."""
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    
    # Validate hostel name
    valid_hostels = ["lohit_girls", "lohit_boys", "papum_boys", "subhanshiri_boys"]
    if hostel not in valid_hostels:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid hostel name. Must be one of: {', '.join(valid_hostels)}",
        )
    
    # Map hostel to warden role
    warden_role_mapping = {
        "lohit_girls": "warden_lohit_girls",
        "lohit_boys": "warden_lohit_boys",
        "papum_boys": "warden_papum_boys",
        "subhanshiri_boys": "warden_subhanshiri_boys"
    }
    
    # Assign warden role
    user.role = warden_role_mapping[hostel]
    db.commit()
    db.refresh(user)
    
    return user

@router.put("/users/{user_id}/allocate-hostel", response_model=schemas.UserResponse)
async def allocate_student_hostel(
    user_id: int,
    student_type: str,
    current_user: models.User = Depends(get_hmc_user),
    db: Session = Depends(get_db)
):
    """
    Allocate a student to a hostel based on predefined criteria (HMC only).
    student_type can be: "female", "phd_male", or "male"
    """
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    
    # Verify this is a student
    if user.role != "student":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Hostel can only be allocated to students",
        )
    
    # Validate student type
    valid_types = ["female", "phd_male", "male"]
    if student_type not in valid_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid student type. Must be one of: {', '.join(valid_types)}",
        )
    
    # Allocate hostel
    user.hostel = allocate_hostel_for_student(student_type, db)
    db.commit()
    db.refresh(user)
    
    return user

@router.get("/hostels/{hostel}/students", response_model=List[schemas.UserResponse])
async def get_hostel_students(
    hostel: str,
    current_user: models.User = Depends(get_warden_user),
    db: Session = Depends(get_db)
):
    """Get all students in a specific hostel (HMC and Wardens)."""
    # Validate hostel name
    valid_hostels = ["lohit_girls", "lohit_boys", "papum_boys", "subhanshiri_boys"]
    if hostel not in valid_hostels:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid hostel name. Must be one of: {', '.join(valid_hostels)}",
        )
    
    # For wardens, check if they have access to this hostel
    warden_mapping = {
        "lohit_girls": "warden_lohit_girls",
        "lohit_boys": "warden_lohit_boys",
        "papum_boys": "warden_papum_boys",
        "subhanshiri_boys": "warden_subhanshiri_boys"
    }
    
    # If user is a warden, ensure they can only see their hostel
    if current_user.role in warden_mapping.values() and current_user.role != warden_mapping[hostel]:
        if current_user.role != "admin" and current_user.role != "hmc":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only view students in your assigned hostel.",
            )
    
    # Get all students in this hostel
    students = db.query(models.User).filter(
        models.User.hostel == hostel,
        models.User.role == "student"
    ).all()
    
    return students

# Admin Endpoints
@router.get("/users/", response_model=List[schemas.UserResponse])
async def get_users(
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(get_hmc_user),
    db: Session = Depends(get_db)
):
    """Get all users (admin and HMC only)."""
    users = db.query(models.User).offset(skip).limit(limit).all()
    return users

@router.get("/users/{user_id}", response_model=schemas.UserResponse)
async def get_user(
    user_id: int,
    current_user: models.User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Get user by ID (admin only)."""
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    return user

@router.put("/users/{user_id}", response_model=schemas.UserResponse)
async def update_user(
    user_id: int,
    user_update: schemas.UserUpdate,
    current_user: models.User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Update user by ID (admin only)."""
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    
    if user_update.email is not None:
        # Check if new email is already taken
        if user_update.email != user.email:
            existing_user = db.query(models.User).filter(models.User.email == user_update.email).first()
            if existing_user:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email already registered",
                )
        user.email = user_update.email
    
    if user_update.full_name is not None:
        user.full_name = user_update.full_name
    
    if user_update.phone_number is not None:
        user.phone_number = user_update.phone_number
    
    if user_update.is_active is not None:
        user.is_active = user_update.is_active
    
    db.commit()
    db.refresh(user)
    
    return user

@router.delete("/users/{user_id}")
async def delete_user(
    user_id: int,
    current_user: models.User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Delete user by ID (admin only)."""
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    
    db.delete(user)
    db.commit()
    
    return {"message": "User deleted successfully"}
