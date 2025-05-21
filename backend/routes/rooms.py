from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func, or_
from typing import List, Optional, Dict
from datetime import datetime

import models
import schemas
from database import get_db
from auth import get_current_active_user, get_staff_or_admin_user

router = APIRouter()

@router.post("/rooms/", response_model=schemas.RoomResponse, status_code=status.HTTP_201_CREATED)
async def create_room(
    room: schemas.RoomCreate,
    current_user: models.User = Depends(get_staff_or_admin_user),
    db: Session = Depends(get_db)
):
    """Create a new room (staff or admin only)."""
    # Check if room number already exists
    existing_room = db.query(models.Room).filter(models.Room.number == room.number).first()
    if existing_room:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Room with this number already exists",
        )
    
    # Create new room
    db_room = models.Room(
        number=room.number,
        floor=room.floor,
        building=room.building,
        type=room.type,
        capacity=room.capacity
    )
    
    db.add(db_room)
    db.commit()
    db.refresh(db_room)
    
    return db_room

@router.get("/rooms", response_model=List[schemas.RoomResponse])
@router.get("/rooms/", response_model=List[schemas.RoomResponse])
async def get_rooms(
    skip: int = 0,
    limit: int = 100,
    building: Optional[str] = None,
    floor: Optional[int] = None,
    type: Optional[str] = None,
    hostel: Optional[str] = None,
    available: Optional[bool] = None,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get all rooms with optional filtering."""
    query = db.query(models.Room)
    
    # Apply filters if provided
    if building:
        query = query.filter(models.Room.building == building)
    if floor is not None:
        query = query.filter(models.Room.floor == floor)
    if type:
        query = query.filter(models.Room.type == type)
    if hostel:
        query = query.filter(models.Room.hostel == hostel)
    
    # Filter for available rooms if requested
    if available:
        # Simpler approach to find available rooms
        # Get rooms that have fewer allocations than their capacity
        subquery = db.query(
            models.RoomAllocation.room_id,
            func.count(models.RoomAllocation.id).label('allocation_count')
        ).filter(
            models.RoomAllocation.status == "current"
        ).group_by(
            models.RoomAllocation.room_id
        ).subquery()
        
        query = query.outerjoin(
            subquery, models.Room.id == subquery.c.room_id
        ).filter(
            or_(
                subquery.c.allocation_count == None,  # No allocations
                subquery.c.allocation_count < models.Room.capacity  # Has space available
            )
        )
    
    rooms = query.offset(skip).limit(limit).all()
    return rooms

@router.get("/rooms/{room_id}", response_model=schemas.RoomResponse)
async def get_room(
    room_id: int,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get room by ID."""
    room = db.query(models.Room).filter(models.Room.id == room_id).first()
    if room is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Room not found",
        )
    return room

@router.put("/rooms/{room_id}", response_model=schemas.RoomResponse)
async def update_room(
    room_id: int,
    room_update: schemas.RoomUpdate,
    current_user: models.User = Depends(get_staff_or_admin_user),
    db: Session = Depends(get_db)
):
    """Update room by ID (staff or admin only)."""
    room = db.query(models.Room).filter(models.Room.id == room_id).first()
    if room is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Room not found",
        )
    
    # Check if updating room number would create a duplicate
    if room_update.number is not None and room_update.number != room.number:
        existing_room = db.query(models.Room).filter(models.Room.number == room_update.number).first()
        if existing_room:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Room with this number already exists",
            )
    
    # Update fields if provided
    if room_update.number is not None:
        room.number = room_update.number
    
    if room_update.floor is not None:
        room.floor = room_update.floor
    
    if room_update.building is not None:
        room.building = room_update.building
    
    if room_update.type is not None:
        room.type = room_update.type
    
    if room_update.capacity is not None:
        room.capacity = room_update.capacity
    
    db.commit()
    db.refresh(room)
    
    return room

@router.delete("/rooms/{room_id}")
async def delete_room(
    room_id: int,
    current_user: models.User = Depends(get_staff_or_admin_user),
    db: Session = Depends(get_db)
):
    """Delete room by ID (staff or admin only)."""
    room = db.query(models.Room).filter(models.Room.id == room_id).first()
    if room is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Room not found",
        )
    
    # Check if there are active allocations for this room
    active_allocations = db.query(models.RoomAllocation).filter(
        models.RoomAllocation.room_id == room_id,
        models.RoomAllocation.status == "current"
    ).count()
    
    if active_allocations > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete room with active allocations",
        )
    
    db.delete(room)
    db.commit()
    
    return {"message": "Room deleted successfully"}

@router.get("/rooms/{room_id}/available-beds", response_model=Dict[str, List[int]])
async def get_available_beds(
    room_id: int,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get available beds for a specific room."""
    # Check if room exists
    room = db.query(models.Room).filter(models.Room.id == room_id).first()
    if room is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Room not found",
        )
    
    # Get all beds allocated to this room
    allocated_beds = db.query(models.RoomAllocation.bed_number).filter(
        models.RoomAllocation.room_id == room_id,
        models.RoomAllocation.status == "current"
    ).all()
    
    # Convert to a list of bed numbers
    allocated_bed_numbers = [bed[0] for bed in allocated_beds]
    
    # Calculate available beds (all beds from 1 to capacity that are not allocated)
    all_beds = list(range(1, room.capacity + 1))
    available_beds = [bed for bed in all_beds if bed not in allocated_bed_numbers]
    
    return {"available_beds": available_beds}

@router.post("/rooms/allocations/", response_model=schemas.RoomAllocationResponse, status_code=status.HTTP_201_CREATED)
async def create_room_allocation(
    allocation: schemas.RoomAllocationCreate,
    current_user: models.User = Depends(get_staff_or_admin_user),
    db: Session = Depends(get_db)
):
    """Allocate a room to a user (staff or admin only)."""
    # Check if user exists
    user = db.query(models.User).filter(models.User.id == allocation.user_id).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    
    # Check if room exists
    room = db.query(models.Room).filter(models.Room.id == allocation.room_id).first()
    if room is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Room not found",
        )
    
    # Check if bed number is valid for the room
    if allocation.bed_number < 1 or allocation.bed_number > room.capacity:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid bed number. Room capacity is {room.capacity}",
        )
    
    # Check if bed is already allocated
    existing_allocation = db.query(models.RoomAllocation).filter(
        models.RoomAllocation.room_id == allocation.room_id,
        models.RoomAllocation.bed_number == allocation.bed_number,
        models.RoomAllocation.status == "current"
    ).first()
    
    if existing_allocation:
        # Get all available beds for this room
        allocated_beds = db.query(models.RoomAllocation.bed_number).filter(
            models.RoomAllocation.room_id == allocation.room_id,
            models.RoomAllocation.status == "current"
        ).all()
        
        allocated_bed_numbers = [bed[0] for bed in allocated_beds]
        all_beds = list(range(1, room.capacity + 1))
        available_beds = [bed for bed in all_beds if bed not in allocated_bed_numbers]
        
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "message": "This bed is already allocated",
                "available_beds": available_beds
            },
        )
    
    # Check if user already has a current allocation
    user_allocation = db.query(models.RoomAllocation).filter(
        models.RoomAllocation.user_id == allocation.user_id,
        models.RoomAllocation.status == "current"
    ).first()
    
    if user_allocation:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User already has a room allocation",
        )
    
    # Create new allocation
    db_allocation = models.RoomAllocation(
        bed_number=allocation.bed_number,
        start_date=allocation.start_date,
        end_date=allocation.end_date,
        status=allocation.status,
        user_id=allocation.user_id,
        room_id=allocation.room_id
    )
    
    db.add(db_allocation)
    db.commit()
    db.refresh(db_allocation)
    
    return db_allocation

@router.get("/rooms/allocations/", response_model=List[schemas.RoomAllocationResponse])
async def get_room_allocations(
    skip: int = 0,
    limit: int = 100,
    room_id: Optional[int] = None,
    user_id: Optional[int] = None,
    status: Optional[str] = None,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get all room allocations with optional filtering."""
    query = db.query(models.RoomAllocation)
    
    # Students can only see their own allocations
    if current_user.role == "student":
        query = query.filter(models.RoomAllocation.user_id == current_user.id)
    else:
        # For staff/admin, apply user_id filter if provided
        if user_id is not None:
            query = query.filter(models.RoomAllocation.user_id == user_id)
    
    # Apply other filters if provided
    if room_id is not None:
        query = query.filter(models.RoomAllocation.room_id == room_id)
    
    if status:
        query = query.filter(models.RoomAllocation.status == status)
    
    allocations = query.offset(skip).limit(limit).all()
    return allocations

@router.get("/rooms/allocations/{allocation_id}", response_model=schemas.RoomAllocationResponse)
async def get_room_allocation(
    allocation_id: int,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get room allocation by ID."""
    allocation = db.query(models.RoomAllocation).filter(models.RoomAllocation.id == allocation_id).first()
    if allocation is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Room allocation not found",
        )
    
    # Check if user has permission to view this allocation
    if current_user.role == "student" and allocation.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to view this allocation",
        )
    
    return allocation

@router.put("/rooms/allocations/{allocation_id}", response_model=schemas.RoomAllocationResponse)
async def update_room_allocation(
    allocation_id: int,
    allocation_update: schemas.RoomAllocationUpdate,
    current_user: models.User = Depends(get_staff_or_admin_user),
    db: Session = Depends(get_db)
):
    """Update room allocation by ID (staff or admin only)."""
    allocation = db.query(models.RoomAllocation).filter(models.RoomAllocation.id == allocation_id).first()
    if allocation is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Room allocation not found",
        )
    
    # If updating bed number, check if it's valid and available
    if allocation_update.bed_number is not None:
        room = db.query(models.Room).filter(models.Room.id == allocation.room_id).first()
        
        # Check if bed number is valid for the room
        if allocation_update.bed_number < 1 or allocation_update.bed_number > room.capacity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid bed number. Room capacity is {room.capacity}",
            )
        
        # Check if bed is already allocated to someone else
        if allocation_update.bed_number != allocation.bed_number:
            existing_allocation = db.query(models.RoomAllocation).filter(
                models.RoomAllocation.room_id == allocation.room_id,
                models.RoomAllocation.bed_number == allocation_update.bed_number,
                models.RoomAllocation.status == "current",
                models.RoomAllocation.id != allocation_id
            ).first()
            
            if existing_allocation:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="This bed is already allocated",
                )
    
    # Update fields if provided
    if allocation_update.bed_number is not None:
        allocation.bed_number = allocation_update.bed_number
    
    if allocation_update.start_date is not None:
        allocation.start_date = allocation_update.start_date
    
    if allocation_update.end_date is not None:
        allocation.end_date = allocation_update.end_date
    
    if allocation_update.status is not None:
        allocation.status = allocation_update.status
    
    db.commit()
    db.refresh(allocation)
    
    return allocation

@router.delete("/rooms/allocations/{allocation_id}")
async def delete_room_allocation(
    allocation_id: int,
    current_user: models.User = Depends(get_staff_or_admin_user),
    db: Session = Depends(get_db)
):
    """Delete room allocation by ID (staff or admin only)."""
    allocation = db.query(models.RoomAllocation).filter(models.RoomAllocation.id == allocation_id).first()
    if allocation is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Room allocation not found",
        )
    
    db.delete(allocation)
    db.commit()
    
    return {"message": "Room allocation deleted successfully"}
