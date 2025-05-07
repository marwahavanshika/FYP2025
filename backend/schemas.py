from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field, validator

# Token Schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    user_id: Optional[str] = None
    role: Optional[str] = None

# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    phone_number: Optional[str] = None
    hostel: Optional[str] = None

class UserCreate(UserBase):
    password: str
    role: Optional[str] = "student"

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    phone_number: Optional[str] = None
    hostel: Optional[str] = None
    is_active: Optional[bool] = None

class UserUpdatePassword(BaseModel):
    current_password: str
    new_password: str

class UserResponse(UserBase):
    id: int
    role: str
    is_active: bool
    created_at: datetime

    class Config:
        orm_mode = True

# Asset Schemas
class AssetBase(BaseModel):
    name: str
    asset_type: str
    description: Optional[str] = None
    location: str
    status: str = "available"
    condition: str = "good"

class AssetCreate(AssetBase):
    purchase_date: datetime
    warranty_until: Optional[datetime] = None

class AssetUpdate(BaseModel):
    name: Optional[str] = None
    asset_type: Optional[str] = None
    description: Optional[str] = None
    location: Optional[str] = None
    status: Optional[str] = None
    condition: Optional[str] = None
    warranty_until: Optional[datetime] = None

class AssetResponse(AssetBase):
    id: int
    purchase_date: datetime
    warranty_until: Optional[datetime]
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        orm_mode = True

# Complaint Schemas
class ComplaintBase(BaseModel):
    title: str
    description: str
    category: str
    location: str
    hostel: str
    priority: Optional[str] = "medium"

class ComplaintCreate(ComplaintBase):
    pass

class ComplaintAssign(BaseModel):
    assigned_to: int

class ComplaintUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    location: Optional[str] = None
    hostel: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    assigned_to: Optional[int] = None

class ComplaintResponse(ComplaintBase):
    id: int
    status: str
    priority: str
    sentiment_score: Optional[float]
    user_id: int
    assigned_to: Optional[int] = None
    created_at: datetime
    updated_at: Optional[datetime]
    resolved_at: Optional[datetime]
    user: UserResponse

    class Config:
        orm_mode = True

# VoiceComplaint Schema
class VoiceComplaintCreate(BaseModel):
    audio_data: str  # Base64 encoded audio data

# Community Post Schemas
class CommentBase(BaseModel):
    content: str

class CommentCreate(CommentBase):
    post_id: int

class CommentResponse(CommentBase):
    id: int
    user_id: int
    post_id: int
    created_at: datetime
    updated_at: Optional[datetime]
    user: UserResponse

    class Config:
        orm_mode = True

class PostBase(BaseModel):
    title: str
    content: str
    category: str

class PostCreate(PostBase):
    pass

class PostUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    category: Optional[str] = None

class PostResponse(PostBase):
    id: int
    user_id: int
    sentiment_score: Optional[float]
    created_at: datetime
    updated_at: Optional[datetime]
    user: UserResponse
    comments: List[CommentResponse] = []

    class Config:
        orm_mode = True

# Room Schemas
class RoomBase(BaseModel):
    number: str
    floor: int
    building: str
    hostel: str
    type: str
    capacity: int

class RoomCreate(RoomBase):
    pass

class RoomUpdate(BaseModel):
    number: Optional[str] = None
    floor: Optional[int] = None
    building: Optional[str] = None
    type: Optional[str] = None
    capacity: Optional[int] = None

class RoomResponse(RoomBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        orm_mode = True

# Room Allocation Schemas
class RoomAllocationBase(BaseModel):
    bed_number: int
    start_date: datetime
    end_date: Optional[datetime] = None
    status: str = "current"

class RoomAllocationCreate(RoomAllocationBase):
    user_id: int
    room_id: int

class RoomAllocationUpdate(BaseModel):
    bed_number: Optional[int] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    status: Optional[str] = None

class RoomAllocationResponse(RoomAllocationBase):
    id: int
    user_id: int
    room_id: int
    created_at: datetime
    updated_at: Optional[datetime]
    user: UserResponse
    room: RoomResponse

    class Config:
        orm_mode = True

# Mess Menu Schemas
class MessMenuBase(BaseModel):
    day_of_week: str
    meal_type: str
    description: str

class MessMenuCreate(MessMenuBase):
    pass

class MessMenuUpdate(BaseModel):
    day_of_week: Optional[str] = None
    meal_type: Optional[str] = None
    description: Optional[str] = None

class MessMenuResponse(MessMenuBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        orm_mode = True

# Mess Feedback Schemas
class MessFeedbackBase(BaseModel):
    rating: int
    comment: Optional[str] = None
    meal_type: str

    @validator('rating')
    def rating_must_be_valid(cls, v):
        if v < 1 or v > 5:
            raise ValueError('Rating must be between 1 and 5')
        return v

class MessFeedbackCreate(MessFeedbackBase):
    pass

class MessFeedbackResponse(MessFeedbackBase):
    id: int
    user_id: int
    sentiment_score: Optional[float]
    created_at: datetime
    user: UserResponse

    class Config:
        orm_mode = True

# Login Schema
class UserLogin(BaseModel):
    email: EmailStr
    password: str
