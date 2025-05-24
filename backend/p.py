import sqlite3
import os

def migrate_database():
    """Add missing upvote_count column to complaints table"""
    
    # Path to your database file
    db_path = "hostel_management.db"
    
    if not os.path.exists(db_path):
        print(f"Database file {db_path} not found!")
        return
    
    try:
        # Connect to the database
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Check if upvote_count column exists
        cursor.execute("PRAGMA table_info(complaints)")
        columns = [column[1] for column in cursor.fetchall()]
        
        if 'upvote_count' not in columns:
            print("Adding upvote_count column to complaints table...")
            cursor.execute("ALTER TABLE complaints ADD COLUMN upvote_count INTEGER DEFAULT 0")
            conn.commit()
            print("Successfully added upvote_count column!")
        else:
            print("upvote_count column already exists!")
            
        # Check if downvote_count column exists (you might need this too)
        if 'downvote_count' not in columns:
            print("Adding downvote_count column to complaints table...")
            cursor.execute("ALTER TABLE complaints ADD COLUMN downvote_count INTEGER DEFAULT 0")
            conn.commit()
            print("Successfully added downvote_count column!")
        
        conn.close()
        print("Database migration completed successfully!")
        
    except Exception as e:
        print(f"Error during migration: {e}")

if __name__ == "__main__":
    migrate_database()