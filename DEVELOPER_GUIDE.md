# HostelAiNexus Developer Guide

This guide provides technical information for developers working on the HostelAiNexus system, including database schema details and API endpoint documentation.

## Database Schema

The HostelAiNexus system uses a relational database with the following main entities:

### User

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  phone_number VARCHAR(20),
  role VARCHAR(50) NOT NULL,
  hostel VARCHAR(50),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP
);
```

### Complaints

```sql
CREATE TABLE complaints (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(50) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  priority VARCHAR(20) DEFAULT 'medium',
  location VARCHAR(255) NOT NULL,
  hostel VARCHAR(50) NOT NULL,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  assigned_to INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP,
  resolved_at TIMESTAMP,
  sentiment_score FLOAT
);
```

### Room

```sql
CREATE TABLE rooms (
  id SERIAL PRIMARY KEY,
  number VARCHAR(20) NOT NULL,
  floor INTEGER NOT NULL,
  building VARCHAR(50) NOT NULL,
  hostel VARCHAR(50) NOT NULL,
  type VARCHAR(20) NOT NULL,
  capacity INTEGER NOT NULL,
  UNIQUE(number, building, hostel)
);
```

### RoomAllocation

```sql
CREATE TABLE room_allocations (
  id SERIAL PRIMARY KEY,
  bed_number INTEGER NOT NULL,
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP,
  status VARCHAR(20) DEFAULT 'current',
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  room_id INTEGER REFERENCES rooms(id) ON DELETE CASCADE,
  UNIQUE(user_id, room_id, status, bed_number)
);
```

### Asset

```sql
CREATE TABLE assets (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  asset_type VARCHAR(50) NOT NULL,
  description TEXT,
  location VARCHAR(255) NOT NULL,
  hostel VARCHAR(50) NOT NULL,
  status VARCHAR(20) DEFAULT 'available',
  purchase_date TIMESTAMP,
  warranty_until TIMESTAMP,
  condition VARCHAR(20) DEFAULT 'good'
);
```

### MessMenu

```sql
CREATE TABLE mess_menu (
  id SERIAL PRIMARY KEY,
  day_of_week VARCHAR(10) NOT NULL,
  meal_type VARCHAR(20) NOT NULL,
  description TEXT NOT NULL,
  UNIQUE(day_of_week, meal_type)
);
```

### MessFeedback

```sql
CREATE TABLE mess_feedback (
  id SERIAL PRIMARY KEY,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  meal_type VARCHAR(20) NOT NULL,
  sentiment_score FLOAT,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### CommunityPost

```sql
CREATE TABLE community_posts (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(50) NOT NULL,
  sentiment_score FLOAT,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP
);
```

### Comment

```sql
CREATE TABLE comments (
  id SERIAL PRIMARY KEY,
  content TEXT NOT NULL,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  post_id INTEGER REFERENCES community_posts(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP
);
```

## API Endpoints

### Authentication

#### POST /api/auth/login
- **Description**: Authenticate a user and generate JWT token
- **Request Body**:
  ```json
  {
    "email": "user@hostel.edu",
    "password": "password123"
  }
  ```
- **Response**:
  ```json
  {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "bearer",
    "user": {
      "id": 1,
      "email": "user@hostel.edu",
      "full_name": "User Name",
      "role": "student",
      "hostel": "lohit_girls"
    }
  }
  ```

#### POST /api/auth/register
- **Description**: Register a new user (admin only)
- **Authorization**: Admin token required
- **Request Body**:
  ```json
  {
    "email": "newuser@hostel.edu",
    "password": "securepassword",
    "full_name": "New User",
    "phone_number": "+91-9876543210",
    "role": "student",
    "hostel": "lohit_girls"
  }
  ```
- **Response**:
  ```json
  {
    "id": 16,
    "email": "newuser@hostel.edu",
    "full_name": "New User",
    "role": "student",
    "hostel": "lohit_girls",
    "created_at": "2023-06-10T12:00:00Z"
  }
  ```

### Users

#### GET /api/users/
- **Description**: Get all users (admin/hmc only)
- **Authorization**: Admin/HMC token required
- **Query Parameters**:
  - `role`: Filter by role
  - `hostel`: Filter by hostel
  - `is_active`: Filter by active status
- **Response**: Array of user objects

#### GET /api/users/{user_id}
- **Description**: Get user details
- **Authorization**: Admin/HMC/Warden token or own user
- **Response**: User object

#### PUT /api/users/{user_id}
- **Description**: Update user information
- **Authorization**: Admin token or own user
- **Request Body**: User object with fields to update
- **Response**: Updated user object

#### DELETE /api/users/{user_id}
- **Description**: Deactivate user (soft delete)
- **Authorization**: Admin token required
- **Response**: Success message

### Complaints

#### GET /api/complaints/
- **Description**: Get all complaints
- **Authorization**: Any authenticated user
- **Query Parameters**:
  - `hostel`: Filter by hostel
  - `status`: Filter by status
  - `category`: Filter by category
  - `user_id`: Filter by user
- **Response**: Array of complaint objects

#### GET /api/complaints/{complaint_id}
- **Description**: Get complaint details
- **Authorization**: Any authenticated user
- **Response**: Complaint object

#### POST /api/complaints/
- **Description**: Create a new complaint
- **Authorization**: Any authenticated user
- **Request Body**:
  ```json
  {
    "title": "Water Leakage",
    "description": "Continuous water leakage from bathroom tap",
    "category": "plumbing",
    "priority": "medium",
    "location": "Room 101",
    "hostel": "lohit_girls"
  }
  ```
- **Response**: Created complaint object

#### PUT /api/complaints/{complaint_id}
- **Description**: Update complaint
- **Authorization**: Owner, Admin, HMC, or assigned staff
- **Request Body**: Complaint object with fields to update
- **Response**: Updated complaint object

#### PATCH /api/complaints/{complaint_id}/status
- **Description**: Update complaint status
- **Authorization**: Admin, HMC, Warden, or assigned staff
- **Request Body**:
  ```json
  {
    "status": "in_progress",
    "comment": "Working on fixing the leak"
  }
  ```
- **Response**: Updated complaint object

#### DELETE /api/complaints/{complaint_id}
- **Description**: Delete complaint
- **Authorization**: Admin only
- **Response**: Success message

### Rooms

#### GET /api/rooms/
- **Description**: Get all rooms
- **Authorization**: Admin, HMC, or Wardens
- **Query Parameters**:
  - `hostel`: Filter by hostel
  - `floor`: Filter by floor
  - `type`: Filter by room type
- **Response**: Array of room objects

#### GET /api/rooms/{room_id}
- **Description**: Get room details
- **Authorization**: Admin, HMC, or Wardens
- **Response**: Room object with allocations

#### POST /api/rooms/
- **Description**: Create a new room
- **Authorization**: Admin or HMC
- **Request Body**: Room object
- **Response**: Created room object

#### PUT /api/rooms/{room_id}
- **Description**: Update room information
- **Authorization**: Admin or HMC
- **Request Body**: Room object with fields to update
- **Response**: Updated room object

#### DELETE /api/rooms/{room_id}
- **Description**: Delete room
- **Authorization**: Admin only
- **Response**: Success message

### Room Allocations

#### GET /api/room-allocations/
- **Description**: Get all room allocations
- **Authorization**: Admin, HMC, or Wardens
- **Query Parameters**:
  - `hostel`: Filter by hostel
  - `status`: Filter by status
  - `user_id`: Filter by user
- **Response**: Array of allocation objects

#### POST /api/room-allocations/
- **Description**: Create a new room allocation
- **Authorization**: Admin, HMC, or Wardens
- **Request Body**: Allocation object
- **Response**: Created allocation object

#### PUT /api/room-allocations/{allocation_id}
- **Description**: Update allocation
- **Authorization**: Admin, HMC, or Wardens
- **Request Body**: Allocation object with fields to update
- **Response**: Updated allocation object

#### DELETE /api/room-allocations/{allocation_id}
- **Description**: End an allocation (set end_date)
- **Authorization**: Admin, HMC, or Wardens
- **Response**: Updated allocation object

### Assets

#### GET /api/assets/
- **Description**: Get all assets
- **Authorization**: Admin, HMC, or Wardens
- **Query Parameters**:
  - `hostel`: Filter by hostel
  - `asset_type`: Filter by type
  - `status`: Filter by status
- **Response**: Array of asset objects

#### POST /api/assets/
- **Description**: Create a new asset
- **Authorization**: Admin or HMC
- **Request Body**: Asset object
- **Response**: Created asset object

#### PUT /api/assets/{asset_id}
- **Description**: Update asset information
- **Authorization**: Admin, HMC, or Wardens
- **Request Body**: Asset object with fields to update
- **Response**: Updated asset object

#### PATCH /api/assets/{asset_id}/status
- **Description**: Update asset status
- **Authorization**: Admin, HMC, or Wardens
- **Request Body**:
  ```json
  {
    "status": "under_repair",
    "condition": "poor"
  }
  ```
- **Response**: Updated asset object

#### DELETE /api/assets/{asset_id}
- **Description**: Delete asset
- **Authorization**: Admin only
- **Response**: Success message

### Mess Menu

#### GET /api/mess-menu/
- **Description**: Get full mess menu
- **Authorization**: Any authenticated user
- **Query Parameters**:
  - `day_of_week`: Filter by day
  - `meal_type`: Filter by meal type
- **Response**: Array of menu items

#### POST /api/mess-menu/
- **Description**: Create a new menu item
- **Authorization**: Admin, HMC, or Mess Vendor
- **Request Body**: Menu item object
- **Response**: Created menu item object

#### PUT /api/mess-menu/{menu_id}
- **Description**: Update menu item
- **Authorization**: Admin, HMC, or Mess Vendor
- **Request Body**: Menu item object with fields to update
- **Response**: Updated menu item object

#### DELETE /api/mess-menu/{menu_id}
- **Description**: Delete menu item
- **Authorization**: Admin, HMC, or Mess Vendor
- **Response**: Success message

### Mess Feedback

#### GET /api/mess-feedback/
- **Description**: Get all mess feedback
- **Authorization**: Admin, HMC, or Mess Vendor
- **Query Parameters**:
  - `meal_type`: Filter by meal type
  - `rating`: Filter by rating
  - `user_id`: Filter by user
- **Response**: Array of feedback objects

#### POST /api/mess-feedback/
- **Description**: Submit new feedback
- **Authorization**: Any authenticated user
- **Request Body**: Feedback object
- **Response**: Created feedback object

#### GET /api/mess-feedback/analytics
- **Description**: Get feedback analytics
- **Authorization**: Admin, HMC, or Mess Vendor
- **Query Parameters**:
  - `start_date`: Start date for analysis
  - `end_date`: End date for analysis
  - `meal_type`: Filter by meal type
- **Response**: Analytics object with average ratings and sentiment scores

### Community Posts

#### GET /api/community/
- **Description**: Get all community posts
- **Authorization**: Any authenticated user
- **Query Parameters**:
  - `category`: Filter by category
  - `user_id`: Filter by user
- **Response**: Array of post objects with comments

#### GET /api/community/{post_id}
- **Description**: Get post details with comments
- **Authorization**: Any authenticated user
- **Response**: Post object with comments

#### POST /api/community/
- **Description**: Create a new post
- **Authorization**: Any authenticated user
- **Request Body**: Post object
- **Response**: Created post object

#### PUT /api/community/{post_id}
- **Description**: Update post
- **Authorization**: Post owner or Admin
- **Request Body**: Post object with fields to update
- **Response**: Updated post object

#### DELETE /api/community/{post_id}
- **Description**: Delete post
- **Authorization**: Post owner or Admin
- **Response**: Success message

#### POST /api/community/{post_id}/comments
- **Description**: Add comment to a post
- **Authorization**: Any authenticated user
- **Request Body**:
  ```json
  {
    "content": "This is a comment"
  }
  ```
- **Response**: Created comment object

### Dashboard Data

#### GET /api/dashboard/{role}
- **Description**: Get dashboard data based on user role
- **Authorization**: Authenticated user with matching role
- **Response**: Role-specific dashboard data

## Authentication and Authorization

The system uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <token>
```

## Error Handling

All API errors follow a standardized format:

```json
{
  "detail": {
    "message": "Error message description",
    "code": "ERROR_CODE",
    "status_code": 400
  }
}
```

Common error codes:
- `AUTHENTICATION_ERROR`: Invalid or expired token
- `AUTHORIZATION_ERROR`: Insufficient permissions
- `VALIDATION_ERROR`: Invalid input data
- `RESOURCE_NOT_FOUND`: Requested resource does not exist
- `CONFLICT_ERROR`: Operation would cause a conflict
- `SERVER_ERROR`: Internal server error

## AI Features API

### POST /api/ai/analyze-sentiment
- **Description**: Analyze text sentiment
- **Authorization**: Admin or HMC
- **Request Body**:
  ```json
  {
    "text": "The food quality is very poor today."
  }
  ```
- **Response**:
  ```json
  {
    "sentiment_score": -0.75,
    "sentiment_category": "negative"
  }
  ```

### POST /api/ai/categorize-complaint
- **Description**: Auto-categorize a complaint
- **Authorization**: Any authenticated user
- **Request Body**:
  ```json
  {
    "title": "Water tap leaking",
    "description": "The bathroom tap has been leaking for two days."
  }
  ```
- **Response**:
  ```json
  {
    "suggested_category": "plumbing",
    "confidence": 0.92
  }
  ```

## Development Environment

### Setting Up Local Development

1. Clone the repository
2. Install backend dependencies:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```
3. Install frontend dependencies:
   ```bash
   cd frontend
   npm install
   ```
4. Set up the database:
   ```bash
   cd backend
   alembic upgrade head
   ```
5. Start the backend server:
   ```bash
   uvicorn main:app --reload
   ```
6. Start the frontend development server:
   ```bash
   cd frontend
   npm start
   ```

### Environment Variables

Create a `.env` file in the backend directory with:

```
DATABASE_URL=postgresql://user:password@localhost/hostel_db
SECRET_KEY=your_secret_key
ACCESS_TOKEN_EXPIRE_MINUTES=60
CORS_ORIGINS=http://localhost:3000
```

Create a `.env` file in the frontend directory with:

```
REACT_APP_API_URL=http://localhost:8000/api
```

## Testing

Run backend tests:
```bash
cd backend
pytest
```

Run frontend tests:
```bash
cd frontend
npm test
```

## Deployment

The application can be deployed using Docker:

```bash
docker-compose up -d
```

The Docker Compose configuration sets up:
- PostgreSQL database
- Backend FastAPI container
- Frontend React container
- Nginx for serving the frontend and routing API requests

## Version Control

Follow these guidelines for version control:
- Use feature branches named `feature/feature-name`
- Create pull requests for code review
- Maintain a clean commit history with descriptive messages

## Documentation

API documentation is auto-generated and available at:
- Swagger UI: `/docs`
- ReDoc: `/redoc`

Update the documentation by adding docstrings to your API endpoint functions.

## Contributing

1. Follow the coding style guides for Python (PEP 8) and JavaScript (Airbnb)
2. Write tests for new features
3. Document all API endpoints and components
4. Create descriptive pull requests 