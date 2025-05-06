from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

import models
import schemas
import ai_utils
from database import get_db
from auth import get_current_active_user, get_staff_or_admin_user

router = APIRouter()

@router.post("/complaints/", response_model=schemas.ComplaintResponse, status_code=status.HTTP_201_CREATED)
async def create_complaint(
    complaint: schemas.ComplaintCreate,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a new complaint."""
    # Use AI to analyze and categorize the complaint
    if not complaint.category or complaint.category == "auto":
        complaint.category = ai_utils.categorize_complaint(f"{complaint.title} {complaint.description}")
    
    # Analyze sentiment
    sentiment_score = ai_utils.analyze_sentiment(f"{complaint.title} {complaint.description}")
    
    # Determine priority if not specified
    if not complaint.priority or complaint.priority == "auto":
        complaint.priority = ai_utils.prioritize_complaint(
            f"{complaint.title} {complaint.description}", 
            complaint.category
        )
    
    # Create new complaint
    db_complaint = models.Complaint(
        title=complaint.title,
        description=complaint.description,
        category=complaint.category,
        location=complaint.location,
        priority=complaint.priority,
        sentiment_score=sentiment_score,
        user_id=current_user.id
    )
    
    db.add(db_complaint)
    db.commit()
    db.refresh(db_complaint)
    
    return db_complaint

@router.post("/complaints/voice", response_model=schemas.ComplaintResponse, status_code=status.HTTP_201_CREATED)
async def create_voice_complaint(
    voice_complaint: schemas.VoiceComplaintCreate,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a complaint from voice input."""
    # Convert speech to text
    complaint_text = ai_utils.speech_to_text(voice_complaint.audio_data)
    
    if complaint_text.startswith("Error"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=complaint_text
        )
    
    # Extract title (first sentence) and description (rest of text)
    sentences = complaint_text.split('.')
    title = sentences[0].strip()
    description = '.'.join(sentences[1:]).strip()
    
    if not description:
        description = title
        title = f"Voice Complaint {datetime.now().strftime('%Y-%m-%d %H:%M')}"
    
    # Categorize and analyze the complaint
    category = ai_utils.categorize_complaint(complaint_text)
    sentiment_score = ai_utils.analyze_sentiment(complaint_text)
    priority = ai_utils.prioritize_complaint(complaint_text, category)
    
    # Create new complaint
    db_complaint = models.Complaint(
        title=title,
        description=description,
        category=category,
        location="To be specified",  # Default location, user should update this later
        priority=priority,
        sentiment_score=sentiment_score,
        user_id=current_user.id
    )
    
    db.add(db_complaint)
    db.commit()
    db.refresh(db_complaint)
    
    return db_complaint

@router.get("/complaints/", response_model=List[schemas.ComplaintResponse])
async def get_complaints(
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None,
    category: Optional[str] = None,
    priority: Optional[str] = None,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get all complaints with optional filtering."""
    query = db.query(models.Complaint)
    
    # Filter by user role
    if current_user.role == "student":
        # Students can only see their own complaints
        query = query.filter(models.Complaint.user_id == current_user.id)
    
    # Apply other filters if provided
    if status:
        query = query.filter(models.Complaint.status == status)
    if category:
        query = query.filter(models.Complaint.category == category)
    if priority:
        query = query.filter(models.Complaint.priority == priority)
    
    complaints = query.order_by(models.Complaint.created_at.desc()).offset(skip).limit(limit).all()
    return complaints

@router.get("/complaints/{complaint_id}", response_model=schemas.ComplaintResponse)
async def get_complaint(
    complaint_id: int,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get complaint by ID."""
    complaint = db.query(models.Complaint).filter(models.Complaint.id == complaint_id).first()
    if complaint is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Complaint not found",
        )
    
    # Check if user has permission to view this complaint
    if current_user.role == "student" and complaint.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to view this complaint",
        )
    
    return complaint

@router.put("/complaints/{complaint_id}", response_model=schemas.ComplaintResponse)
async def update_complaint(
    complaint_id: int,
    complaint_update: schemas.ComplaintUpdate,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update complaint by ID."""
    complaint = db.query(models.Complaint).filter(models.Complaint.id == complaint_id).first()
    if complaint is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Complaint not found",
        )
    
    # Check if user has permission to update this complaint
    if current_user.role == "student":
        if complaint.user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have permission to update this complaint",
            )
        
        # Students can only update certain fields
        if complaint_update.status is not None:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Students cannot update the status of a complaint",
            )
    
    # Update fields if provided
    if complaint_update.title is not None:
        complaint.title = complaint_update.title
    
    if complaint_update.description is not None:
        complaint.description = complaint_update.description
        # Re-analyze sentiment if description is updated
        sentiment_score = ai_utils.analyze_sentiment(f"{complaint.title} {complaint.description}")
        complaint.sentiment_score = sentiment_score
    
    if complaint_update.category is not None:
        complaint.category = complaint_update.category
    
    if complaint_update.location is not None:
        complaint.location = complaint_update.location
    
    if complaint_update.priority is not None and current_user.role != "student":
        complaint.priority = complaint_update.priority
    
    if complaint_update.status is not None and current_user.role != "student":
        complaint.status = complaint_update.status
        # If status is changed to resolved, update resolved_at timestamp
        if complaint_update.status == "resolved":
            complaint.resolved_at = datetime.now()
    
    db.commit()
    db.refresh(complaint)
    
    return complaint

@router.delete("/complaints/{complaint_id}")
async def delete_complaint(
    complaint_id: int,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Delete complaint by ID."""
    complaint = db.query(models.Complaint).filter(models.Complaint.id == complaint_id).first()
    if complaint is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Complaint not found",
        )
    
    # Check if user has permission to delete this complaint
    if current_user.role == "student" and complaint.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to delete this complaint",
        )
    
    db.delete(complaint)
    db.commit()
    
    return {"message": "Complaint deleted successfully"}

@router.get("/complaints/{complaint_id}/suggestions", response_model=List[str])
async def get_complaint_suggestions(
    complaint_id: int,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get AI-generated suggestions for resolving a complaint."""
    complaint = db.query(models.Complaint).filter(models.Complaint.id == complaint_id).first()
    if complaint is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Complaint not found",
        )
    
    # Check if user has permission to view this complaint
    if current_user.role == "student" and complaint.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to view this complaint",
        )
    
    # Generate suggestions
    suggestions = ai_utils.get_complaint_suggestions(complaint.category, complaint.description)
    
    return suggestions
