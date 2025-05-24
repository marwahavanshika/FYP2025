from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

import models
import schemas
import ai_utils
from database import get_db
from auth import (
    get_current_active_user, 
    get_staff_or_admin_user, 
    get_hmc_user, 
    get_warden_user, 
    get_maintenance_user,
    get_mess_vendor_user
)

router = APIRouter()

@router.post("/complaints/", response_model=schemas.ComplaintResponse, status_code=status.HTTP_201_CREATED)
async def create_complaint(
    complaint: schemas.ComplaintCreate,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a new complaint."""
    print(f"Received complaint data: {complaint}")  # Add this line for debugging

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
    
    # For students, automatically use their assigned hostel
    complaint_hostel = None
    if current_user.role == "student":
        if not current_user.hostel:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You must be assigned to a hostel before filing complaints",
            )
        complaint_hostel = current_user.hostel
    else:
        # For non-students, hostel must be specified in the payload
        complaint_hostel = complaint.hostel
        if not complaint_hostel:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Hostel must be specified for non-student complaints",
            )
    
    # Auto-assign complaint to relevant maintenance staff based on category
    assigned_to = None
    if complaint.category == "plumbing":
        # Find a plumber
        plumber = db.query(models.User).filter(models.User.role == "plumber").first()
        if plumber:
            assigned_to = plumber.id
    elif complaint.category == "electrical":
        # Find an electrician
        electrician = db.query(models.User).filter(models.User.role == "electrician").first()
        if electrician:
            assigned_to = electrician.id
    elif complaint.category == "mess" or complaint.category == "food":
        # Find a mess vendor
        mess_vendor = db.query(models.User).filter(models.User.role == "mess_vendor").first()
        if mess_vendor:
            assigned_to = mess_vendor.id
    
    # Create new complaint
    db_complaint = models.Complaint(
        title=complaint.title,
        description=complaint.description,
        category=complaint.category,
        location=complaint.location,
        hostel=complaint_hostel,  # Use the determined hostel
        priority=complaint.priority,
        sentiment_score=sentiment_score,
        user_id=current_user.id,
        assigned_to=assigned_to
    )
    
    db.add(db_complaint)
    db.commit()
    db.refresh(db_complaint)
    
    return db_complaint

@router.post("/complaints/voice", response_model=schemas.ComplaintResponse, status_code=status.HTTP_201_CREATED)
async def create_voice_complaint(
    voice_complaint: schemas.VoiceComplaintCreate,
    hostel: str = Query(..., description="The hostel for which the complaint is being filed"),
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
    
    # For students, validate that they're submitting complaints for their own hostel
    if current_user.role == "student":
        if not current_user.hostel:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You must be assigned to a hostel before filing complaints",
            )
        
        if hostel != current_user.hostel:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only file complaints for your assigned hostel",
            )
    
    # Auto-assign complaint to relevant maintenance staff based on category
    assigned_to = None
    if category == "plumbing":
        # Find a plumber
        plumber = db.query(models.User).filter(models.User.role == "plumber").first()
        if plumber:
            assigned_to = plumber.id
    elif category == "electrical":
        # Find an electrician
        electrician = db.query(models.User).filter(models.User.role == "electrician").first()
        if electrician:
            assigned_to = electrician.id
    elif category == "mess" or category == "food":
        # Find a mess vendor
        mess_vendor = db.query(models.User).filter(models.User.role == "mess_vendor").first()
        if mess_vendor:
            assigned_to = mess_vendor.id
    
    # Create new complaint
    db_complaint = models.Complaint(
        title=title,
        description=description,
        category=category,
        location="To be specified",  # Default location, user should update this later
        hostel=hostel,
        priority=priority,
        sentiment_score=sentiment_score,
        user_id=current_user.id,
        assigned_to=assigned_to
    )
    
    db.add(db_complaint)
    db.commit()
    db.refresh(db_complaint)
    
    return db_complaint

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
    if current_user.role == "student":
        # Students can view complaints from their hostel
        if not current_user.hostel:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You must be assigned to a hostel to view complaints",
            )
        if complaint.hostel != current_user.hostel:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only view complaints from your hostel",
            )
    elif current_user.role.startswith("warden_"):
        hostel_mapping = {
            "warden_lohit_girls": "lohit_girls",
            "warden_lohit_boys": "lohit_boys",
            "warden_papum_boys": "papum_boys",
            "warden_subhanshiri_boys": "subhanshiri_boys"
        }
        if complaint.hostel != hostel_mapping[current_user.role]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have permission to view complaints from other hostels",
            )
    elif current_user.role == "plumber" and complaint.category != "plumbing":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only view plumbing complaints",
        )
    elif current_user.role == "electrician" and complaint.category != "electrical":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only view electrical complaints",
        )
    elif current_user.role == "mess_vendor" and complaint.category not in ["mess", "food"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only view mess-related complaints",
        )
    
    # Add has_upvoted information
    has_upvoted = db.query(models.ComplaintUpvote).filter(
        models.ComplaintUpvote.complaint_id == complaint.id,
        models.ComplaintUpvote.user_id == current_user.id
    ).first() is not None
    setattr(complaint, 'has_upvoted', has_upvoted)
    
    return complaint 
# Add both routes with and without trailing slash
@router.get("/complaints", response_model=List[schemas.ComplaintResponse])
@router.get("/complaints/", response_model=List[schemas.ComplaintResponse])
async def get_complaints(
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None,
    category: Optional[str] = None,
    priority: Optional[str] = None,
    hostel: Optional[str] = None,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get all complaints with optional filtering."""
    query = db.query(models.Complaint)
    
    # Filter by user role
    if current_user.role == "student":
        # Students can see complaints from their hostel
        if not current_user.hostel:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You must be assigned to a hostel to view complaints",
            )
        query = query.filter(models.Complaint.hostel == current_user.hostel)
    elif current_user.role.startswith("warden_"):
        # Wardens can only see complaints from their hostel
        hostel_mapping = {
            "warden_lohit_girls": "lohit_girls",
            "warden_lohit_boys": "lohit_boys",
            "warden_papum_boys": "papum_boys",
            "warden_subhanshiri_boys": "subhanshiri_boys"
        }
        query = query.filter(models.Complaint.hostel == hostel_mapping[current_user.role])
    elif current_user.role == "plumber":
        # Plumbers only see plumbing complaints
        query = query.filter(models.Complaint.category == "plumbing")
    elif current_user.role == "electrician":
        # Electricians only see electrical complaints
        query = query.filter(models.Complaint.category == "electrical")
    elif current_user.role == "mess_vendor":
        # Mess vendors only see mess-related complaints
        query = query.filter(models.Complaint.category.in_(["mess", "food"]))
    # Admin and HMC can see all complaints (no filter)
    
    # Apply other filters if provided
    if status:
        query = query.filter(models.Complaint.status == status)
    if category:
        query = query.filter(models.Complaint.category == category)
    if priority:
        query = query.filter(models.Complaint.priority == priority)
    if hostel:
        query = query.filter(models.Complaint.hostel == hostel)
    
    complaints = query.order_by(models.Complaint.created_at.desc()).offset(skip).limit(limit).all()
    
    # Add has_upvoted information for each complaint
    for complaint in complaints:
        # Check if current user has upvoted this complaint
        has_upvoted = db.query(models.ComplaintUpvote).filter(
            models.ComplaintUpvote.complaint_id == complaint.id,
            models.ComplaintUpvote.user_id == current_user.id
        ).first() is not None
        setattr(complaint, 'has_upvoted', has_upvoted)
    
    return complaints

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
        
        if complaint_update.hostel is not None and complaint_update.hostel != current_user.hostel:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only file complaints for your assigned hostel",
            )
    elif current_user.role.startswith("warden_"):
        hostel_mapping = {
            "warden_lohit_girls": "lohit_girls",
            "warden_lohit_boys": "lohit_boys",
            "warden_papum_boys": "papum_boys",
            "warden_subhanshiri_boys": "subhanshiri_boys"
        }
        if complaint.hostel != hostel_mapping[current_user.role]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have permission to update complaints from other hostels",
            )
    elif current_user.role == "plumber" and complaint.category != "plumbing":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only update plumbing complaints",
        )
    elif current_user.role == "electrician" and complaint.category != "electrical":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only update electrical complaints",
        )
    elif current_user.role == "mess_vendor" and complaint.category not in ["mess", "food"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only update mess-related complaints",
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
    
    if complaint_update.hostel is not None and current_user.role != "student":
        complaint.hostel = complaint_update.hostel
    
    if complaint_update.priority is not None and current_user.role != "student":
        complaint.priority = complaint_update.priority
    
    if complaint_update.status is not None and current_user.role != "student":
        # Update status and set resolved_at if resolved
        complaint.status = complaint_update.status
        if complaint_update.status == "resolved":
            complaint.resolved_at = datetime.now()
    
    if complaint_update.assigned_to is not None:
        # Only HMC and admin can assign complaints
        if current_user.role not in ["admin", "hmc"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only HMC and admin can assign complaints",
            )
        complaint.assigned_to = complaint_update.assigned_to
    
    db.commit()
    db.refresh(complaint)
    
    return complaint

@router.post("/complaints/{complaint_id}/assign", response_model=schemas.ComplaintResponse)
async def assign_complaint(
    complaint_id: int,
    assignment: schemas.ComplaintAssign,
    current_user: models.User = Depends(get_hmc_user),
    db: Session = Depends(get_db)
):
    """Assign a complaint to a staff member (HMC or Admin only)."""
    complaint = db.query(models.Complaint).filter(models.Complaint.id == complaint_id).first()
    if complaint is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Complaint not found",
        )
    
    # Verify the assignee exists
    assignee = db.query(models.User).filter(models.User.id == assignment.assigned_to).first()
    if assignee is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assignee not found",
        )
    
    # Verify the assignee is appropriate for the complaint type
    if complaint.category == "plumbing" and assignee.role != "plumber":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Plumbing complaints should be assigned to a plumber",
        )
    elif complaint.category == "electrical" and assignee.role != "electrician":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Electrical complaints should be assigned to an electrician",
        )
    elif complaint.category in ["mess", "food"] and assignee.role != "mess_vendor":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Mess complaints should be assigned to a mess vendor",
        )
    
    complaint.assigned_to = assignment.assigned_to
    complaint.status = "in_progress"  # Update status to in_progress when assigned
    
    db.commit()
    db.refresh(complaint)
    
    return complaint


@router.post("/complaints/{complaint_id}/upvote", response_model=schemas.ComplaintResponse)
async def upvote_complaint(
    complaint_id: int,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Upvote a complaint. Users can only upvote once."""
    
    # Check if complaint exists
    complaint = db.query(models.Complaint).filter(models.Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Complaint not found"
        )
    
    # Check if user has already upvoted
    existing_upvote = db.query(models.ComplaintUpvote).filter(
        models.ComplaintUpvote.complaint_id == complaint_id,
        models.ComplaintUpvote.user_id == current_user.id
    ).first()
    
    if existing_upvote:
        # Remove upvote if it exists (toggle behavior)
        db.delete(existing_upvote)
        complaint.upvote_count -= 1
        has_upvoted = False
    else:
        # Create new upvote
        upvote = models.ComplaintUpvote(
            complaint_id=complaint_id,
            user_id=current_user.id
        )
        db.add(upvote)
        complaint.upvote_count += 1
        has_upvoted = True
    
    db.commit()
    db.refresh(complaint)
    
    # Set has_upvoted before returning
    setattr(complaint, 'has_upvoted', has_upvoted)
    
    return complaint

@router.get("/complaints/{complaint_id}/upvotes", response_model=List[schemas.UserResponse])
async def get_complaint_upvoters(
    complaint_id: int,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get list of users who upvoted this complaint."""
    complaint = db.query(models.Complaint).filter(models.Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Complaint not found"
        )
    
    upvoters = db.query(models.User).join(
        models.ComplaintUpvote
    ).filter(
        models.ComplaintUpvote.complaint_id == complaint_id
    ).all()
    
    return upvoters
