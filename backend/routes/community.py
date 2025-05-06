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

@router.post("/community/posts/", response_model=schemas.PostResponse, status_code=status.HTTP_201_CREATED)
async def create_post(
    post: schemas.PostCreate,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a new community post."""
    # Analyze sentiment
    sentiment_score = ai_utils.analyze_sentiment(f"{post.title} {post.content}")
    
    # Create new post
    db_post = models.CommunityPost(
        title=post.title,
        content=post.content,
        category=post.category,
        sentiment_score=sentiment_score,
        user_id=current_user.id
    )
    
    db.add(db_post)
    db.commit()
    db.refresh(db_post)
    
    return db_post

@router.get("/community/posts/", response_model=List[schemas.PostResponse])
async def get_posts(
    skip: int = 0,
    limit: int = 100,
    category: Optional[str] = None,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get all community posts with optional filtering."""
    query = db.query(models.CommunityPost)
    
    # Apply filters if provided
    if category:
        query = query.filter(models.CommunityPost.category == category)
    
    posts = query.order_by(models.CommunityPost.created_at.desc()).offset(skip).limit(limit).all()
    return posts

@router.get("/community/posts/{post_id}", response_model=schemas.PostResponse)
async def get_post(
    post_id: int,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get community post by ID."""
    post = db.query(models.CommunityPost).filter(models.CommunityPost.id == post_id).first()
    if post is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found",
        )
    
    return post

@router.put("/community/posts/{post_id}", response_model=schemas.PostResponse)
async def update_post(
    post_id: int,
    post_update: schemas.PostUpdate,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update community post by ID."""
    post = db.query(models.CommunityPost).filter(models.CommunityPost.id == post_id).first()
    if post is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found",
        )
    
    # Check if user has permission to update this post
    if current_user.role == "student" and post.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to update this post",
        )
    
    # Update fields if provided
    if post_update.title is not None:
        post.title = post_update.title
    
    if post_update.content is not None:
        post.content = post_update.content
    
    if post_update.category is not None:
        post.category = post_update.category
    
    # Re-analyze sentiment if content or title is updated
    if post_update.title is not None or post_update.content is not None:
        sentiment_score = ai_utils.analyze_sentiment(f"{post.title} {post.content}")
        post.sentiment_score = sentiment_score
    
    db.commit()
    db.refresh(post)
    
    return post

@router.delete("/community/posts/{post_id}")
async def delete_post(
    post_id: int,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Delete community post by ID."""
    post = db.query(models.CommunityPost).filter(models.CommunityPost.id == post_id).first()
    if post is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found",
        )
    
    # Check if user has permission to delete this post
    if current_user.role == "student" and post.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to delete this post",
        )
    
    db.delete(post)
    db.commit()
    
    return {"message": "Post deleted successfully"}

@router.post("/community/comments/", response_model=schemas.CommentResponse, status_code=status.HTTP_201_CREATED)
async def create_comment(
    comment: schemas.CommentCreate,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a new comment on a community post."""
    # Check if post exists
    post = db.query(models.CommunityPost).filter(models.CommunityPost.id == comment.post_id).first()
    if post is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found",
        )
    
    # Create new comment
    db_comment = models.Comment(
        content=comment.content,
        post_id=comment.post_id,
        user_id=current_user.id
    )
    
    db.add(db_comment)
    db.commit()
    db.refresh(db_comment)
    
    return db_comment

@router.get("/community/posts/{post_id}/comments", response_model=List[schemas.CommentResponse])
async def get_post_comments(
    post_id: int,
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get all comments for a specific post."""
    # Check if post exists
    post = db.query(models.CommunityPost).filter(models.CommunityPost.id == post_id).first()
    if post is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found",
        )
    
    comments = db.query(models.Comment).filter(
        models.Comment.post_id == post_id
    ).order_by(models.Comment.created_at).offset(skip).limit(limit).all()
    
    return comments

@router.delete("/community/comments/{comment_id}")
async def delete_comment(
    comment_id: int,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Delete comment by ID."""
    comment = db.query(models.Comment).filter(models.Comment.id == comment_id).first()
    if comment is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Comment not found",
        )
    
    # Check if user has permission to delete this comment
    if current_user.role == "student" and comment.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to delete this comment",
        )
    
    db.delete(comment)
    db.commit()
    
    return {"message": "Comment deleted successfully"}
