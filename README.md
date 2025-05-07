# HostelAiNexus - Hostel Management System

**HostelAiNexus** is a comprehensive hostel management system designed to streamline the operations of educational institution hostels. It features role-based access control, complaint management, room allocation, asset tracking, mess management, and community interaction.

## Features

- **Role-Based Access Control**: Different dashboards and features for students, wardens, maintenance staff, mess vendors, and administrators
- **Complaint Management**: File, track, and resolve maintenance issues with AI-powered categorization and sentiment analysis
- **Room Allocation**: Manage student room assignments across different hostels
- **Asset Management**: Track hostel assets, their status, and maintenance history
- **Mess Management**: Schedule meals, collect student feedback, and improve food quality
- **Community Interaction**: Students and staff can post announcements, hold discussions, and organize events

## System Architecture

HostelAiNexus uses a modern stack with:

- **Backend**: Python with FastAPI, SQLAlchemy ORM
- **Frontend**: React with Redux for state management, React Router for navigation
- **Database**: PostgreSQL (can be configured to use SQLite for development)
- **AI Features**: Sentiment analysis, complaint categorization, and voice-to-text processing

## Test Data and Credentials

For testing and demonstration purposes, you can use the test data provided in `test_data.json`. Here's a summary of the available test users:

### User Credentials

| Role | Email | Password | Name |
|------|-------|----------|------|
| Admin | admin@hostel.edu | admin123 | Admin User |
| HMC | hmc@hostel.edu | hmc123 | HMC Head |
| Warden (Lohit Girls) | lohitgirls.warden@hostel.edu | warden123 | Dr. Priya Singh |
| Warden (Lohit Boys) | lohitboys.warden@hostel.edu | warden123 | Dr. Rahul Sharma |
| Warden (Papum Boys) | papumboys.warden@hostel.edu | warden123 | Dr. Ankit Patel |
| Warden (Subhanshiri Boys) | subhanshiriboys.warden@hostel.edu | warden123 | Dr. Vikram Mathur |
| Plumber | plumber@hostel.edu | plumber123 | Rajesh Kumar |
| Electrician | electrician@hostel.edu | electrician123 | Sunil Verma |
| Mess Vendor | messvendor@hostel.edu | mess123 | Govind Caterers |
| Student (Female) | female1@hostel.edu | student123 | Anjali Mishra |
| Student (Female) | female2@hostel.edu | student123 | Neha Gupta |
| Student (Male) | male1@hostel.edu | student123 | Aditya Sharma |
| Student (Male) | male2@hostel.edu | student123 | Rohan Singh |
| Student (PhD Male) | phdmale@hostel.edu | student123 | Anand Mehta |
| Student (Unallocated) | newstudent@hostel.edu | student123 | Kriti Joshi |

### Test Data Summary

The test data includes:
- 15 users with different roles
- 6 sample complaints across various categories
- 8 room entries spanning all hostels
- 5 room allocations for students
- 5 assets (furniture and electronics)
- 6 mess menu items (2 days worth of meals)
- 4 mess feedback entries
- 3 community posts with comments

## Role Descriptions

### Administrator
- Full access to all system features
- Manage users, hostels, and system settings
- View analytics and reports

### HMC (Hostel Management Committee)
- Manage hostel allocations
- Assign wardens to hostels
- Oversee all hostel operations
- Access analytics and reports

### Wardens
- Manage students in their respective hostels
- Handle complaints for their hostel
- Manage hostel assets
- View hostel-specific reports

### Maintenance Staff (Plumber/Electrician)
- View and resolve assigned complaints
- Update status of maintenance tasks
- Access maintenance reports

### Mess Vendor
- Manage mess menu
- View and respond to food-related complaints
- Access mess feedback

### Students
- File complaints
- Provide mess feedback
- Participate in community discussions
- View room allocation details

## Getting Started

1. Clone the repository
2. Install dependencies for both backend and frontend:
   ```
   # Backend
   cd backend
   pip install -r requirements.txt
   
   # Frontend
   cd ../frontend
   npm install
   ```
3. Start the backend server:
   ```
   cd backend
   uvicorn main:app --reload
   ```
4. Start the frontend development server:
   ```
   cd frontend
   npm start
   ```
5. Access the application at `http://localhost:3000`
6. Log in using any of the test credentials provided above

## API Documentation

Once the backend server is running, you can access the API documentation at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Role-Specific Dashboards

### Student Dashboard
- Overview of complaints filed
- Room allocation details
- Mess feedback history
- Community posts

### Warden Dashboard
- Student list for their hostel
- Complaint management interface
- Hostel occupancy status
- Asset management for their hostel

### Maintenance Staff Dashboard
- List of assigned complaints
- Complaint status management
- Work history

### Mess Vendor Dashboard
- Mess menu management
- Food-related complaint tracking
- Feedback analytics

### HMC Dashboard
- Hostel occupancy statistics
- Warden assignment interface
- Student allocation tool
- System-wide analytics

### Admin Dashboard
- User management
- System configuration
- Comprehensive analytics
- Access to all features

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- FastAPI team for the excellent web framework
- React team for the powerful frontend library
- All contributors to this project
