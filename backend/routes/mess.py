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

@router.post("/mess/menu/", response_model=schemas.MessMenuResponse, status_code=status.HTTP_201_CREATED)
async def create_mess_menu(
    menu: schemas.MessMenuCreate,
    current_user: models.User = Depends(get_staff_or_admin_user),
    db: Session = Depends(get_db)
):
    """Create a new mess menu item (staff or admin only)."""
    # Check if menu item for the same day and meal already exists
    existing_menu = db.query(models.MessMenu).filter(
        models.MessMenu.day_of_week == menu.day_of_week,
        models.MessMenu.meal_type == menu.meal_type
    ).first()
    
    if existing_menu:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Menu for {menu.day_of_week} {menu.meal_type} already exists",
        )
    
    # Create new mess menu item
    db_menu = models.MessMenu(
        day_of_week=menu.day_of_week,
        meal_type=menu.meal_type,
        description=menu.description
    )
    
    db.add(db_menu)
    db.commit()
    db.refresh(db_menu)
    
    return db_menu

@router.get("/mess/menu/", response_model=List[schemas.MessMenuResponse])
async def get_mess_menu(
    skip: int = 0,
    limit: int = 100,
    day_of_week: Optional[str] = None,
    meal_type: Optional[str] = None,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get all mess menu items with optional filtering."""
    query = db.query(models.MessMenu)
    
    # Apply filters if provided
    if day_of_week:
        query = query.filter(models.MessMenu.day_of_week == day_of_week)
    
    if meal_type:
        query = query.filter(models.MessMenu.meal_type == meal_type)
    
    menu_items = query.offset(skip).limit(limit).all()
    return menu_items

@router.get("/mess/menu/{menu_id}", response_model=schemas.MessMenuResponse)
async def get_mess_menu_item(
    menu_id: int,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get mess menu item by ID."""
    menu_item = db.query(models.MessMenu).filter(models.MessMenu.id == menu_id).first()
    if menu_item is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Menu item not found",
        )
    return menu_item

@router.put("/mess/menu/{menu_id}", response_model=schemas.MessMenuResponse)
async def update_mess_menu_item(
    menu_id: int,
    menu_update: schemas.MessMenuUpdate,
    current_user: models.User = Depends(get_staff_or_admin_user),
    db: Session = Depends(get_db)
):
    """Update mess menu item by ID (staff or admin only)."""
    menu_item = db.query(models.MessMenu).filter(models.MessMenu.id == menu_id).first()
    if menu_item is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Menu item not found",
        )
    
    # Check if updating would create a duplicate
    if (menu_update.day_of_week is not None and menu_update.day_of_week != menu_item.day_of_week) or \
       (menu_update.meal_type is not None and menu_update.meal_type != menu_item.meal_type):
        existing_menu = db.query(models.MessMenu).filter(
            models.MessMenu.day_of_week == (menu_update.day_of_week or menu_item.day_of_week),
            models.MessMenu.meal_type == (menu_update.meal_type or menu_item.meal_type),
            models.MessMenu.id != menu_id
        ).first()
        
        if existing_menu:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Menu for {menu_update.day_of_week or menu_item.day_of_week} {menu_update.meal_type or menu_item.meal_type} already exists",
            )
    
    # Update fields if provided
    if menu_update.day_of_week is not None:
        menu_item.day_of_week = menu_update.day_of_week
    
    if menu_update.meal_type is not None:
        menu_item.meal_type = menu_update.meal_type
    
    if menu_update.description is not None:
        menu_item.description = menu_update.description
    
    db.commit()
    db.refresh(menu_item)
    
    return menu_item

@router.delete("/mess/menu/{menu_id}")
async def delete_mess_menu_item(
    menu_id: int,
    current_user: models.User = Depends(get_staff_or_admin_user),
    db: Session = Depends(get_db)
):
    """Delete mess menu item by ID (staff or admin only)."""
    menu_item = db.query(models.MessMenu).filter(models.MessMenu.id == menu_id).first()
    if menu_item is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Menu item not found",
        )
    
    db.delete(menu_item)
    db.commit()
    
    return {"message": "Menu item deleted successfully"}

@router.post("/mess/feedback/", response_model=schemas.MessFeedbackResponse, status_code=status.HTTP_201_CREATED)
async def create_mess_feedback(
    feedback: schemas.MessFeedbackCreate,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Submit feedback for mess food."""
    # Analyze sentiment if comment is provided
    sentiment_score = None
    if feedback.comment:
        sentiment_score = ai_utils.analyze_sentiment(feedback.comment)
    
    # Create new feedback
    db_feedback = models.MessFeedback(
        rating=feedback.rating,
        comment=feedback.comment,
        meal_type=feedback.meal_type,
        sentiment_score=sentiment_score,
        user_id=current_user.id
    )
    
    db.add(db_feedback)
    db.commit()
    db.refresh(db_feedback)
    
    return db_feedback

@router.get("/mess/feedback/", response_model=List[schemas.MessFeedbackResponse])
async def get_mess_feedback(
    skip: int = 0,
    limit: int = 100,
    meal_type: Optional[str] = None,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get all mess feedback with optional filtering."""
    query = db.query(models.MessFeedback)
    
    # Students can only see their own feedback
    if current_user.role == "student":
        query = query.filter(models.MessFeedback.user_id == current_user.id)
    
    # Apply filters if provided
    if meal_type:
        query = query.filter(models.MessFeedback.meal_type == meal_type)
    
    feedback_items = query.order_by(models.MessFeedback.created_at.desc()).offset(skip).limit(limit).all()
    return feedback_items

@router.get("/mess/feedback/stats")
async def get_mess_feedback_stats(
    meal_type: Optional[str] = None,
    days: Optional[int] = 30,
    current_user: models.User = Depends(get_staff_or_admin_user),
    db: Session = Depends(get_db)
):
    """Get statistics on mess feedback (staff or admin only)."""
    from sqlalchemy import func
    from datetime import timedelta
    
    # Base query
    query = db.query(
        func.avg(models.MessFeedback.rating).label("average_rating"),
        func.count(models.MessFeedback.id).label("total_feedback")
    )
    
    # Apply filters
    if meal_type:
        query = query.filter(models.MessFeedback.meal_type == meal_type)
    
    if days:
        since_date = datetime.now() - timedelta(days=days)
        query = query.filter(models.MessFeedback.created_at >= since_date)
    
    # Execute query
    result = query.one()
    
    # Calculate rating distribution
    rating_dist_query = db.query(
        models.MessFeedback.rating,
        func.count(models.MessFeedback.id).label("count")
    ).group_by(models.MessFeedback.rating)
    
    # Apply the same filters
    if meal_type:
        rating_dist_query = rating_dist_query.filter(models.MessFeedback.meal_type == meal_type)
    
    if days:
        rating_dist_query = rating_dist_query.filter(models.MessFeedback.created_at >= since_date)
    
    rating_distribution = {r.rating: r.count for r in rating_dist_query.all()}
    
    # Ensure all ratings are represented
    for i in range(1, 6):
        if i not in rating_distribution:
            rating_distribution[i] = 0
    
    # Calculate sentiment analysis stats if comments are available
    sentiment_query = db.query(
        func.avg(models.MessFeedback.sentiment_score).label("average_sentiment")
    ).filter(models.MessFeedback.sentiment_score.isnot(None))
    
    # Apply the same filters
    if meal_type:
        sentiment_query = sentiment_query.filter(models.MessFeedback.meal_type == meal_type)
    
    if days:
        sentiment_query = sentiment_query.filter(models.MessFeedback.created_at >= since_date)
    
    sentiment_result = sentiment_query.one()
    
    return {
        "average_rating": float(result.average_rating) if result.average_rating else 0,
        "total_feedback": result.total_feedback,
        "rating_distribution": rating_distribution,
        "average_sentiment": float(sentiment_result.average_sentiment) if sentiment_result.average_sentiment else 0,
        "meal_type": meal_type or "all",
        "days": days
    }
