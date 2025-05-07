import os
import json
from sqlalchemy.orm import Session
from database import engine, Base, SessionLocal
import models
from passlib.context import CryptContext
from datetime import datetime, timedelta
import random

# Create password context for hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Make sure the database is created
Base.metadata.create_all(bind=engine)

# Function to hash passwords
def get_password_hash(password):
    return pwd_context.hash(password)

# Function to find an available room for a student based on hostel
def assign_room_for_student(db, student, hostel_rooms):
    if not student.hostel or student.hostel not in hostel_rooms:
        return None, None
    
    # Get all rooms for this hostel
    rooms_data = hostel_rooms[student.hostel]
    
    # Get all existing room allocations for this hostel
    room_numbers = [room["number"] for room in rooms_data]
    existing_rooms = db.query(models.Room).filter(models.Room.hostel == student.hostel).all()
    existing_room_map = {room.number: room for room in existing_rooms}
    
    # Get current occupancy for each room
    for room_number in room_numbers:
        if room_number in existing_room_map:
            room = existing_room_map[room_number]
            # Count allocations for this room
            allocations_count = db.query(models.RoomAllocation).filter(
                models.RoomAllocation.room_id == room.id,
                models.RoomAllocation.status == "current"
            ).count()
            
            # Find the first room with available space
            if allocations_count < room.capacity:
                # Get next available bed number
                used_beds = db.query(models.RoomAllocation.bed_number).filter(
                    models.RoomAllocation.room_id == room.id,
                    models.RoomAllocation.status == "current"
                ).all()
                used_bed_numbers = [bed[0] for bed in used_beds]
                
                for bed_number in range(1, room.capacity + 1):
                    if bed_number not in used_bed_numbers:
                        return room, bed_number
    
    # If no room with space found, return None
    return None, None

# Function to setup the database with test data
def setup_database():
    db = SessionLocal()
    try:
        # Check if we already have users to avoid duplicating data
        existing_users = db.query(models.User).count()
        if existing_users > 0:
            print("Database already contains data. Skipping initialization.")
            return
        
        # Load room data from JSON file
        current_dir = os.path.dirname(os.path.abspath(__file__))
        json_path = os.path.join(current_dir, 'data', 'hostel_rooms.json')
        with open(json_path, 'r') as f:
            hostel_rooms = json.load(f)
        
        # Create rooms from JSON data
        all_rooms = []
        for hostel, rooms_data in hostel_rooms.items():
            for room_data in rooms_data:
                room = models.Room(
                    number=room_data["number"],
                    floor=room_data["floor"],
                    building=room_data["building"],
                    hostel=hostel,
                    type=room_data["type"],
                    capacity=room_data["capacity"]
                )
                all_rooms.append(room)
                db.add(room)
        
        # Create Admin & Management Users
        admin = models.User(
            email="admin@hostel.edu",
            full_name="Admin User",
            hashed_password=get_password_hash("admin123"),
            role="admin",
            phone_number="9876543210"
        )
        db.add(admin)
        
        hmc = models.User(
            email="hmc@hostel.edu",
            full_name="HMC Head",
            hashed_password=get_password_hash("hmc123"),
            role="hmc",
            phone_number="9876543211"
        )
        db.add(hmc)
        
        # Create Wardens
        wardens = [
            models.User(
                email="lohitgirls.warden@hostel.edu",
                full_name="Dr. Priya Singh",
                hashed_password=get_password_hash("warden123"),
                role="warden_lohit_girls",
                hostel="lohit_girls",
                phone_number="9876543212"
            ),
            models.User(
                email="lohitboys.warden@hostel.edu",
                full_name="Dr. Rahul Sharma",
                hashed_password=get_password_hash("warden123"),
                role="warden_lohit_boys",
                hostel="lohit_boys",
                phone_number="9876543213"
            ),
            models.User(
                email="papumboys.warden@hostel.edu",
                full_name="Dr. Ankit Patel",
                hashed_password=get_password_hash("warden123"),
                role="warden_papum_boys",
                hostel="papum_boys",
                phone_number="9876543214"
            ),
            models.User(
                email="subhanshiriboys.warden@hostel.edu",
                full_name="Dr. Vikram Mathur",
                hashed_password=get_password_hash("warden123"),
                role="warden_subhanshiri_boys",
                hostel="subhanshiri_boys",
                phone_number="9876543215"
            )
        ]
        for warden in wardens:
            db.add(warden)
        
        # Create Maintenance Staff
        staff = [
            models.User(
                email="plumber@hostel.edu",
                full_name="Rajesh Kumar",
                hashed_password=get_password_hash("plumber123"),
                role="plumber",
                phone_number="9876543216"
            ),
            models.User(
                email="electrician@hostel.edu",
                full_name="Sunil Verma",
                hashed_password=get_password_hash("electrician123"),
                role="electrician",
                phone_number="9876543217"
            ),
            models.User(
                email="messvendor@hostel.edu",
                full_name="Govind Caterers",
                hashed_password=get_password_hash("mess123"),
                role="mess_vendor",
                phone_number="9876543218"
            )
        ]
        for employee in staff:
            db.add(employee)
        
        # Create Students
        students = [
            models.User(
                email="female1@hostel.edu",
                full_name="Anjali Mishra",
                hashed_password=get_password_hash("student123"),
                role="student",
                hostel="lohit_girls",
                phone_number="9876543219"
            ),
            models.User(
                email="female2@hostel.edu",
                full_name="Neha Gupta",
                hashed_password=get_password_hash("student123"),
                role="student",
                hostel="lohit_girls",
                phone_number="9876543220"
            ),
            models.User(
                email="female3@hostel.edu",
                full_name="Priya Patel",
                hashed_password=get_password_hash("student123"),
                role="student",
                hostel="lohit_girls",
                phone_number="9876543225"
            ),
            models.User(
                email="female4@hostel.edu",
                full_name="Ritu Sharma",
                hashed_password=get_password_hash("student123"),
                role="student",
                hostel="lohit_girls",
                phone_number="9876543226"
            ),
            models.User(
                email="male1@hostel.edu",
                full_name="Aditya Sharma",
                hashed_password=get_password_hash("student123"),
                role="student",
                hostel="lohit_boys",
                phone_number="9876543221"
            ),
            models.User(
                email="male2@hostel.edu",
                full_name="Rohan Singh",
                hashed_password=get_password_hash("student123"),
                role="student",
                hostel="papum_boys",
                phone_number="9876543222"
            ),
            models.User(
                email="male3@hostel.edu",
                full_name="Rahul Kumar",
                hashed_password=get_password_hash("student123"),
                role="student",
                hostel="lohit_boys",
                phone_number="9876543227"
            ),
            models.User(
                email="male4@hostel.edu",
                full_name="Vikram Joshi",
                hashed_password=get_password_hash("student123"),
                role="student",
                hostel="papum_boys",
                phone_number="9876543228"
            ),
            models.User(
                email="phdmale@hostel.edu",
                full_name="Anand Mehta",
                hashed_password=get_password_hash("student123"),
                role="student",
                hostel="subhanshiri_boys",
                phone_number="9876543223"
            ),
            models.User(
                email="phdmale2@hostel.edu",
                full_name="Sunil Gupta",
                hashed_password=get_password_hash("student123"),
                role="student",
                hostel="subhanshiri_boys",
                phone_number="9876543229"
            ),
            models.User(
                email="newstudent@hostel.edu",
                full_name="Kriti Joshi",
                hashed_password=get_password_hash("student123"),
                role="student",
                phone_number="9876543224"
            )
        ]
        for student in students:
            db.add(student)
        
        # Commit changes to get IDs
        db.commit()
        
        # Create room allocations for students with hostels
        start_date = datetime.now() - timedelta(days=30)  # Start date 30 days ago
        
        allocations = []
        
        # Assign rooms to students automatically
        for student in students:
            if student.hostel:
                room, bed_number = assign_room_for_student(db, student, hostel_rooms)
                if room and bed_number:
                    allocation = models.RoomAllocation(
                        user_id=student.id,
                        room_id=room.id,
                        bed_number=bed_number,
                        start_date=start_date
                    )
                    allocations.append(allocation)
                    db.add(allocation)
        
        # Commit allocations
        db.commit()
        
        # Sample Complaints
        plumber = db.query(models.User).filter(models.User.email == "plumber@hostel.edu").first()
        electrician = db.query(models.User).filter(models.User.email == "electrician@hostel.edu").first()
        
        # Access students by email
        anjali = db.query(models.User).filter(models.User.email == "female1@hostel.edu").first()
        neha = db.query(models.User).filter(models.User.email == "female2@hostel.edu").first()
        aditya = db.query(models.User).filter(models.User.email == "male1@hostel.edu").first()
        rohan = db.query(models.User).filter(models.User.email == "male2@hostel.edu").first()
        
        complaints = [
            models.Complaint(
                title="Leaking Tap",
                description="The tap in my bathroom is leaking continuously.",
                category="plumbing",
                location="Bathroom",
                hostel="lohit_girls",
                priority="medium",
                status="in_progress",
                user_id=anjali.id,
                assigned_to=plumber.id
            ),
            models.Complaint(
                title="Power Outage",
                description="No electricity in my room since yesterday evening.",
                category="electrical",
                location="Room",
                hostel="lohit_boys",
                priority="high",
                status="pending",
                user_id=aditya.id
            ),
            models.Complaint(
                title="Broken Chair",
                description="The chair in my room is broken and needs replacement.",
                category="furniture",
                location="Room",
                hostel="papum_boys",
                priority="low",
                status="resolved",
                user_id=rohan.id,
                assigned_to=electrician.id,
                resolved_at=datetime.now()
            ),
            # Additional complaints for Lohit Girls Hostel
            models.Complaint(
                title="Bathroom Light Flickering",
                description="The light in the common bathroom on the first floor is flickering and needs to be fixed.",
                category="electrical",
                location="Common Bathroom",
                hostel="lohit_girls",
                priority="medium",
                status="pending",
                user_id=neha.id
            ),
            models.Complaint(
                title="Common Room AC Not Working",
                description="The air conditioner in the common room is not cooling properly.",
                category="electrical",
                location="Common Room",
                hostel="lohit_girls",
                priority="medium",
                status="pending", 
                user_id=anjali.id
            ),
            models.Complaint(
                title="Water Cooler Maintenance",
                description="The water cooler on the second floor is making strange noises and needs servicing.",
                category="appliance",
                location="Corridor",
                hostel="lohit_girls",
                priority="low",
                status="pending",
                user_id=neha.id
            )
        ]
        for complaint in complaints:
            db.add(complaint)
        
        # Sample Mess Menu
        mess_menu = [
            models.MessMenu(
                day_of_week="Monday",
                meal_type="breakfast",
                description="Idli, Sambar, Coconut Chutney, Tea/Coffee"
            ),
            models.MessMenu(
                day_of_week="Monday",
                meal_type="lunch",
                description="Rice, Dal, Aloo Gobi, Salad, Curd"
            ),
            models.MessMenu(
                day_of_week="Monday",
                meal_type="dinner",
                description="Roti, Paneer Butter Masala, Rice, Dal, Sweet"
            ),
            models.MessMenu(
                day_of_week="Tuesday",
                meal_type="breakfast",
                description="Poha, Jalebi, Tea/Coffee"
            ),
            models.MessMenu(
                day_of_week="Tuesday",
                meal_type="lunch",
                description="Rice, Rajma, Jeera Aloo, Salad, Buttermilk"
            ),
            models.MessMenu(
                day_of_week="Tuesday",
                meal_type="dinner",
                description="Roti, Egg Curry/Veg Kofta, Rice, Dal Fry"
            )
        ]
        for menu in mess_menu:
            db.add(menu)
        
        # Sample Mess Feedback
        mess_feedback = [
            models.MessFeedback(
                user_id=anjali.id,
                rating=4,
                comment="The breakfast was delicious today. Would love to have more variety in fruits.",
                meal_type="breakfast"
            ),
            models.MessFeedback(
                user_id=aditya.id,
                rating=2,
                comment="The rice was undercooked and dal was too watery.",
                meal_type="lunch"
            ),
            models.MessFeedback(
                user_id=rohan.id,
                rating=5,
                comment="Dinner was excellent today. The paneer dish was perfect!",
                meal_type="dinner"
            )
        ]
        for feedback in mess_feedback:
            db.add(feedback)
        
        # Sample Community Posts
        posts = [
            models.CommunityPost(
                title="Sports Meet Announcement",
                content="Annual sports meet will be held on 15th November. Register your names with your respective wardens.",
                category="announcement",
                user_id=hmc.id
            ),
            models.CommunityPost(
                title="Lost Calculator",
                content="I lost my Casio scientific calculator in the library yesterday. If found, please contact me.",
                category="lost_found",
                user_id=aditya.id
            ),
            models.CommunityPost(
                title="Movie Night",
                content="We are organizing a movie night this Saturday at 8 PM in the common room. Everyone is welcome!",
                category="event",
                user_id=anjali.id
            )
        ]
        for post in posts:
            db.add(post)
        
        # Commit all changes
        db.commit()
        
        # Sample Assets for each hostel
        assets = [
            # Lohit Girls Hostel Assets
            models.Asset(
                name="Common Room TV",
                asset_type="electronics",
                description="55-inch Samsung Smart TV",
                location="lohit_girls",
                status="available",
                condition="good",
                purchase_date=datetime.now() - timedelta(days=365)
            ),
            models.Asset(
                name="Water Cooler",
                asset_type="appliance",
                description="Voltas Water Cooler",
                location="lohit_girls",
                status="available",
                condition="good",
                purchase_date=datetime.now() - timedelta(days=180)
            ),
            models.Asset(
                name="Study Tables",
                asset_type="furniture",
                description="20 wooden study tables for common room",
                location="lohit_girls",
                status="in_use",
                condition="good",
                purchase_date=datetime.now() - timedelta(days=300)
            ),
            
            # Lohit Boys Hostel Assets
            models.Asset(
                name="Common Room TV",
                asset_type="electronics",
                description="50-inch LG Smart TV",
                location="lohit_boys",
                status="available",
                condition="good",
                purchase_date=datetime.now() - timedelta(days=400)
            ),
            models.Asset(
                name="Washing Machine",
                asset_type="appliance",
                description="IFB Front Load Washing Machine",
                location="lohit_boys",
                status="under_repair",
                condition="fair",
                purchase_date=datetime.now() - timedelta(days=500)
            ),
            
            # Papum Boys Hostel Assets
            models.Asset(
                name="Ping Pong Table",
                asset_type="furniture",
                description="Stiga Tournament Series Ping Pong Table",
                location="papum_boys",
                status="available",
                condition="good",
                purchase_date=datetime.now() - timedelta(days=250)
            ),
            
            # Subhanshiri Boys Hostel Assets
            models.Asset(
                name="Chess Sets",
                asset_type="recreation",
                description="5 wooden chess sets for common room",
                location="subhanshiri_boys",
                status="available",
                condition="good",
                purchase_date=datetime.now() - timedelta(days=120)
            )
        ]
        
        for asset in assets:
            db.add(asset)
        
        db.commit()
        
        # Print room allocation information
        allocations = db.query(models.RoomAllocation).join(models.User).join(models.Room).all()
        print("\nRoom Allocations:")
        for allocation in allocations:
            student = db.query(models.User).filter(models.User.id == allocation.user_id).first()
            room = db.query(models.Room).filter(models.Room.id == allocation.room_id).first()
            print(f"Student: {student.full_name}, Room: {room.number}, Bed: {allocation.bed_number}")
        
        print("\nDatabase successfully initialized with test data!")
        
    except Exception as e:
        db.rollback()
        print(f"Error initializing database: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    setup_database() 