from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

import models
import schemas
from database import get_db
from auth import get_current_active_user, get_staff_or_admin_user

router = APIRouter()

@router.post("/assets/", response_model=schemas.AssetResponse, status_code=status.HTTP_201_CREATED)
async def create_asset(
    asset: schemas.AssetCreate,
    current_user: models.User = Depends(get_staff_or_admin_user),
    db: Session = Depends(get_db)
):
    """Create a new asset (staff or admin only)."""
    # Create new asset
    db_asset = models.Asset(
        name=asset.name,
        asset_type=asset.asset_type,
        description=asset.description,
        location=asset.location,
        status=asset.status,
        condition=asset.condition,
        purchase_date=asset.purchase_date,
        warranty_until=asset.warranty_until
    )
    
    db.add(db_asset)
    db.commit()
    db.refresh(db_asset)
    
    return db_asset

@router.get("/assets/", response_model=List[schemas.AssetResponse])
async def get_assets(
    skip: int = 0,
    limit: int = 100,
    asset_type: str = None,
    status: str = None,
    location: str = None,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get all assets with optional filtering."""
    query = db.query(models.Asset)
    
    # Apply filters if provided
    if asset_type:
        query = query.filter(models.Asset.asset_type == asset_type)
    if status:
        query = query.filter(models.Asset.status == status)
    if location:
        query = query.filter(models.Asset.location == location)
    
    assets = query.offset(skip).limit(limit).all()
    return assets

@router.get("/assets/{asset_id}", response_model=schemas.AssetResponse)
async def get_asset(
    asset_id: int,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get asset by ID."""
    asset = db.query(models.Asset).filter(models.Asset.id == asset_id).first()
    if asset is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Asset not found",
        )
    return asset

@router.put("/assets/{asset_id}", response_model=schemas.AssetResponse)
async def update_asset(
    asset_id: int,
    asset_update: schemas.AssetUpdate,
    current_user: models.User = Depends(get_staff_or_admin_user),
    db: Session = Depends(get_db)
):
    """Update asset by ID (staff or admin only)."""
    asset = db.query(models.Asset).filter(models.Asset.id == asset_id).first()
    if asset is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Asset not found",
        )
    
    # Update fields if provided
    if asset_update.name is not None:
        asset.name = asset_update.name
    
    if asset_update.asset_type is not None:
        asset.asset_type = asset_update.asset_type
    
    if asset_update.description is not None:
        asset.description = asset_update.description
    
    if asset_update.location is not None:
        asset.location = asset_update.location
    
    if asset_update.status is not None:
        asset.status = asset_update.status
    
    if asset_update.condition is not None:
        asset.condition = asset_update.condition
    
    if asset_update.warranty_until is not None:
        asset.warranty_until = asset_update.warranty_until
    
    db.commit()
    db.refresh(asset)
    
    return asset

@router.delete("/assets/{asset_id}")
async def delete_asset(
    asset_id: int,
    current_user: models.User = Depends(get_staff_or_admin_user),
    db: Session = Depends(get_db)
):
    """Delete asset by ID (staff or admin only)."""
    asset = db.query(models.Asset).filter(models.Asset.id == asset_id).first()
    if asset is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Asset not found",
        )
    
    db.delete(asset)
    db.commit()
    
    return {"message": "Asset deleted successfully"}
