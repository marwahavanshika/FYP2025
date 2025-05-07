from sqlalchemy import Boolean, Column, DateTime, Enum, ForeignKey, Integer, String, Text, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    full_name = Column(String)
    hashed_password = Column(String)
    phone_number = Column(String)
    role = Column(String, default="student")  # student, admin, hmc, warden_lohit_girls, warden_lohit_boys, warden_papum_boys, warden_subhanshiri_boys, plumber, electrician, mess_vendor
    hostel = Column(String, nullable=True)  # lohit_girls, lohit_boys, papum_boys, subhanshiri_boys
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    complaints = relationship("Complaint", back_populates="user", foreign_keys="Complaint.user_id")
    assigned_complaints = relationship("Complaint", back_populates="assignee", foreign_keys="Complaint.assigned_to")
    posts = relationship("CommunityPost", back_populates="user")
    comments = relationship("Comment", back_populates="user")
    room_allocation = relationship("RoomAllocation", back_populates="user")
    mess_feedback = relationship("MessFeedback", back_populates="user")

class Asset(Base):
    __tablename__ = "assets"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    asset_type = Column(String, index=True)  # furniture, electronics, etc.
    description = Column(String)
    location = Column(String)
    status = Column(String, default="available")  # available, in_use, under_repair, discarded
    purchase_date = Column(DateTime(timezone=True))
    warranty_until = Column(DateTime(timezone=True), nullable=True)
    condition = Column(String, default="good")  # good, fair, poor
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class Complaint(Base):
    __tablename__ = "complaints"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(Text)
    category = Column(String, index=True)  # plumbing, electrical, cleaning, mess, etc.
    status = Column(String, default="pending")  # pending, in_progress, resolved, rejected
    priority = Column(String, default="medium")  # low, medium, high, urgent
    sentiment_score = Column(Float, nullable=True)  # AI-generated sentiment score
    location = Column(String)
    hostel = Column(String, index=True)  # lohit_girls, lohit_boys, papum_boys, subhanshiri_boys
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    resolved_at = Column(DateTime(timezone=True), nullable=True)
    assigned_to = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # Foreign keys
    user_id = Column(Integer, ForeignKey("users.id"))
    
    # Relationships
    user = relationship("User", back_populates="complaints", foreign_keys=[user_id])
    assignee = relationship("User", back_populates="assigned_complaints", foreign_keys=[assigned_to])

class CommunityPost(Base):
    __tablename__ = "community_posts"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    content = Column(Text)
    category = Column(String, index=True)  # announcement, discussion, event, lost_found
    sentiment_score = Column(Float, nullable=True)  # AI-generated sentiment score
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Foreign keys
    user_id = Column(Integer, ForeignKey("users.id"))
    
    # Relationships
    user = relationship("User", back_populates="posts")
    comments = relationship("Comment", back_populates="post", cascade="all, delete-orphan")

class Comment(Base):
    __tablename__ = "comments"

    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Foreign keys
    user_id = Column(Integer, ForeignKey("users.id"))
    post_id = Column(Integer, ForeignKey("community_posts.id"))
    
    # Relationships
    user = relationship("User", back_populates="comments")
    post = relationship("CommunityPost", back_populates="comments")

class Room(Base):
    __tablename__ = "rooms"

    id = Column(Integer, primary_key=True, index=True)
    number = Column(String, unique=True, index=True)
    floor = Column(Integer)
    building = Column(String)
    hostel = Column(String, index=True)  # lohit_girls, lohit_boys, papum_boys, subhanshiri_boys
    type = Column(String)  # single, double, triple, dormitory
    capacity = Column(Integer)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    allocations = relationship("RoomAllocation", back_populates="room")

class RoomAllocation(Base):
    __tablename__ = "room_allocations"

    id = Column(Integer, primary_key=True, index=True)
    bed_number = Column(Integer)
    start_date = Column(DateTime(timezone=True))
    end_date = Column(DateTime(timezone=True), nullable=True)
    status = Column(String, default="current")  # current, past, cancelled
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Foreign keys
    user_id = Column(Integer, ForeignKey("users.id"))
    room_id = Column(Integer, ForeignKey("rooms.id"))
    
    # Relationships
    user = relationship("User", back_populates="room_allocation")
    room = relationship("Room", back_populates="allocations")

class MessMenu(Base):
    __tablename__ = "mess_menus"

    id = Column(Integer, primary_key=True, index=True)
    day_of_week = Column(String)  # Monday, Tuesday, etc.
    meal_type = Column(String)  # breakfast, lunch, dinner
    description = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class MessFeedback(Base):
    __tablename__ = "mess_feedback"

    id = Column(Integer, primary_key=True, index=True)
    rating = Column(Integer)  # 1-5
    comment = Column(Text)
    meal_type = Column(String)  # breakfast, lunch, dinner
    sentiment_score = Column(Float, nullable=True)  # AI-generated sentiment score
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Foreign keys
    user_id = Column(Integer, ForeignKey("users.id"))
    
    # Relationships
    user = relationship("User", back_populates="mess_feedback")
