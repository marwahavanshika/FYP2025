# HostelAiNexus Backend

This is the backend service for the HostelAiNexus Hostel Management System, built with FastAPI and SQLAlchemy.

## 🛠️ Technology Stack

- **Framework**: FastAPI
- **ORM**: SQLAlchemy
- **Database**: SQLite (dev), PostgreSQL (prod)
- **Authentication**: JWT with bcrypt password hashing
- **AI Components**: NLTK for NLP tasks

## 🔧 Setup and Installation

### Prerequisites

- Python 3.11+
- pip

### Installation Steps

1. **Create a virtual environment**:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Environment Variables**:
   Create a `.env` file in the backend directory with:
   ```
   SECRET_KEY=your_secret_key_here
   DATABASE_URL=sqlite:///hostel_management.db
   JWT_SECRET=your_jwt_secret
   ENVIRONMENT=development
   ```

4. **Run the server**:
   ```bash
   python main.py
   ```
   
   The API will be available at `http://localhost:8000`.

## 📚 API Documentation

### Authentication Endpoints

#### Register a new user

```
POST /api/users/register
```

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "name": "John Doe",
  "role": "student",
  "phone_number": "1234567890"
}
```

**Response**:
```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "John Doe",
  "role": "student",
  "created_at": "2023-05-15T10:30:00"
}
```

#### Login

```
POST /api/users/login
```

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "role": "student"
  }
}
```

### Room Management Endpoints

#### Get all rooms

```
GET /api/rooms
```

**Response**:
```json
[
  {
    "id": 1,
    "room_number": "A-101",
    "floor": 1,
    "capacity": 2,
    "occupants": 1,
    "room_type": "standard"
  },
  {
    "id": 2,
    "room_number": "B-202",
    "floor": 2,
    "capacity": 3,
    "occupants": 2,
    "room_type": "suite"
  }
]
```

#### Allocate a room

```
POST /api/rooms/allocate
```

**Request Body**:
```json
{
  "user_id": 1,
  "room_id": 2,
  "from_date": "2023-06-01",
  "to_date": "2023-12-31"
}
```

**Response**:
```json
{
  "id": 1,
  "user_id": 1,
  "room_id": 2,
  "from_date": "2023-06-01",
  "to_date": "2023-12-31",
  "status": "active"
}
```

### Complaint Management

#### Create a complaint

```
POST /api/complaints
```

**Request Body**:
```json
{
  "title": "Water leakage in bathroom",
  "description": "There is water leaking from the shower head in my bathroom.",
  "category": "maintenance",
  "priority": "medium"
}
```

**Response**:
```json
{
  "id": 1,
  "title": "Water leakage in bathroom",
  "description": "There is water leaking from the shower head in my bathroom.",
  "category": "maintenance",
  "priority": "medium",
  "status": "open",
  "created_at": "2023-05-15T14:30:00",
  "user_id": 1
}
```

#### Get user complaints

```
GET /api/complaints/user
```

**Response**:
```json
[
  {
    "id": 1,
    "title": "Water leakage in bathroom",
    "description": "There is water leaking from the shower head in my bathroom.",
    "category": "maintenance",
    "priority": "medium",
    "status": "open",
    "created_at": "2023-05-15T14:30:00"
  }
]
```

### Asset Management

#### Create an asset

```
POST /api/assets
```

**Request Body**:
```json
{
  "name": "Dining Table",
  "category": "furniture",
  "location": "Mess Hall",
  "purchase_date": "2023-01-15",
  "purchase_cost": 1500.00,
  "condition": "new"
}
```

**Response**:
```json
{
  "id": 1,
  "name": "Dining Table",
  "category": "furniture",
  "location": "Mess Hall",
  "purchase_date": "2023-01-15",
  "purchase_cost": 1500.00,
  "condition": "new",
  "created_at": "2023-05-15T15:30:00"
}
```

### Mess Feedback

#### Submit feedback

```
POST /api/mess/feedback
```

**Request Body**:
```json
{
  "meal_type": "lunch",
  "date": "2023-05-15",
  "rating": 4,
  "feedback": "The food was good today. Enjoyed the vegetable curry."
}
```

**Response**:
```json
{
  "id": 1,
  "meal_type": "lunch",
  "date": "2023-05-15",
  "rating": 4,
  "feedback": "The food was good today. Enjoyed the vegetable curry.",
  "sentiment_score": 0.8,
  "user_id": 1,
  "created_at": "2023-05-15T16:30:00"
}
```

## 🧠 AI Features

### Sentiment Analysis for Feedback

The backend uses Natural Language Processing to analyze mess feedback and extract sentiment scores.

Example of how to use the AI analysis:

```python
from ai_utils import analyze_sentiment

feedback_text = "The food was good today. Enjoyed the vegetable curry."
sentiment_score = analyze_sentiment(feedback_text)
# Returns a score between -1 (very negative) and 1 (very positive)
```

### Room Allocation Recommendation

The system uses resident preferences and compatibility data to suggest optimal room pairings:

```python
from ai_utils import get_room_recommendations

recommendations = get_room_recommendations(user_id=1, preferences={
    "floor_preference": 2,
    "roommate_interests": ["sports", "reading"],
    "quiet_hours_preference": "strict"
})
```

## 🔍 Database Schema

The main entities in the database include:

1. **User**: Store user information and credentials
2. **Room**: Represents physical rooms in the hostel
3. **RoomAllocation**: Tracks which users are assigned to which rooms
4. **Complaint**: User-submitted issues that need resolution
5. **Asset**: Physical assets owned by the hostel
6. **MessFeedback**: User feedback on meals
7. **CommunityPost**: Posts for the community bulletin board

## 🧪 Testing

Run tests using pytest:

```bash
pytest
```

For specific test files:

```bash
pytest tests/test_users.py
```

## 📝 Logging

Logs are stored in the `logs` directory. The log level can be configured in the `.env` file:

```
LOG_LEVEL=INFO
```

## 🔄 Data Migrations

Database migrations are handled by Alembic:

```bash
# Create a migration
alembic revision --autogenerate -m "description"

# Run migrations
alembic upgrade head
```

---

For any additional information or troubleshooting, please refer to the main project README or contact the development team. 