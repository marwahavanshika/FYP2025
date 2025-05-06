# HostelAiNexus - AI-Enhanced Hostel Management System

HostelAiNexus is a comprehensive hostel management system enhanced with AI capabilities to streamline administrative tasks, improve resident experience, and provide intelligent insights for better decision-making.

![HostelAiNexus Logo](./generated-icon.png)

## 🚀 Features

- **Smart Room Allocation**: AI-powered room assignment based on preferences and compatibility
- **Asset Management**: Track hostel assets, maintenance schedules, and usage
- **Complaint Management**: Digital system for residents to report and track resolution of issues
- **Community Portal**: Foster community engagement and organize events
- **Mess Feedback System**: Collect and analyze feedback on meal quality and service
- **Admin Dashboard**: Comprehensive analytics for hostel administrators
- **User Profiles**: Personalized experience for each resident

## 🛠️ Tech Stack

- **Frontend**: React, Redux, TailwindCSS, Chart.js
- **Backend**: FastAPI, SQLAlchemy, Python
- **AI Components**: Natural Language Processing for feedback analysis and resident matching
- **Database**: SQLite (development), PostgreSQL (production-ready)

## 📋 Prerequisites

- Node.js (v14.0.0 or later)
- Python (v3.11 or later)
- npm or yarn

## 🔧 Setup and Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/HostelAiNexus.git
cd HostelAiNexus
```

### 2. Backend Setup

```bash
# Navigate to the backend directory
cd backend

# Create a virtual environment (optional but recommended)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the backend server
python main.py
```

The backend server will start on http://localhost:8000

### 3. Frontend Setup

```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm start
```

The frontend development server will start on http://localhost:5000

## 🔐 Authentication

The system uses JWT-based authentication. Default admin credentials:

- **Email**: admin@hostelainexus.com
- **Password**: admin123

⚠️ **Important**: Change these credentials in production!

## 🌐 Environment Variables

Create `.env` files in both frontend and backend directories for configuration:

### Backend `.env` Example:

```
SECRET_KEY=your_secret_key_here
DATABASE_URL=sqlite:///hostel_management.db
ENVIRONMENT=development
```

### Frontend `.env` Example:

```
VITE_API_URL=http://localhost:8000/api
```

## 🧪 Testing

```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
npm test
```

## 📦 Deployment

The application is configured for easy deployment on platforms like:

- Heroku
- Vercel
- Azure
- AWS

See the deployment guides in the `docs` folder for platform-specific instructions.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Contact

For any questions or suggestions, please reach out to:
- Email: support@hostelainexus.com
- Website: [www.hostelainexus.com](https://www.hostelainexus.com)

---

⭐ Star this repo if you find it useful! ⭐
