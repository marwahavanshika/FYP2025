# HostelAiNexus Frontend

This is the frontend application for the HostelAiNexus Hostel Management System, built with React, Redux, and TailwindCSS.

## 🛠️ Technology Stack

- **Framework**: React 18
- **State Management**: Redux Toolkit
- **Routing**: React Router v6
- **Styling**: TailwindCSS
- **Form Handling**: Formik + Yup
- **Data Visualization**: Chart.js
- **API Client**: Axios
- **Build Tool**: Vite

## 🔧 Setup and Installation

### Prerequisites

- Node.js (v14.0.0 or later)
- npm or yarn

### Installation Steps

1. **Navigate to the frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Setup**:
   Create a `.env` file in the frontend directory with:
   ```
   VITE_API_URL=http://localhost:8000/api
   ```

4. **Start the development server**:
   ```bash
   npm start
   # or
   yarn start
   ```

   The application will be available at `http://localhost:5000`.

## 🧩 Frontend Architecture

### Directory Structure

```
frontend/
├── public/                # Static files
├── src/                   # Source code
│   ├── components/        # Reusable UI components
│   ├── pages/             # Page components
│   ├── store/             # Redux store configuration
│   │   ├── slices/        # Redux slices for state management
│   │   └── index.js       # Store configuration
│   ├── services/          # API services
│   ├── utils/             # Utility functions
│   ├── hooks/             # Custom React hooks
│   ├── App.jsx            # Main App component
│   └── index.js           # Entry point
├── .env                   # Environment variables
└── package.json           # Dependencies and scripts
```

## 📱 Main Features & Components

### Authentication & User Management

The frontend implements JWT-based authentication with protected routes.

**Example of protected route usage**:

```jsx
// In App.jsx
<Route 
  path="/dashboard" 
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  } 
/>
```

**Login Component Example**:

```jsx
// Login form with Formik
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useDispatch } from 'react-redux';
import { login } from '../store/slices/authSlice';

const Login = () => {
  const dispatch = useDispatch();
  
  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: Yup.object({
      email: Yup.string().email('Invalid email address').required('Required'),
      password: Yup.string().required('Required'),
    }),
    onSubmit: (values) => {
      dispatch(login(values));
    },
  });
  
  return (
    <form onSubmit={formik.handleSubmit}>
      {/* Form fields */}
    </form>
  );
};
```

### Dashboard

The dashboard provides a comprehensive overview of the hostel status, including:

- Occupancy rate
- Recent complaints
- Upcoming events
- Asset utilization
- Mess feedback ratings

**Dashboard Component Example**:

```jsx
// Dashboard component with multiple widgets
const Dashboard = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <OccupancyWidget />
      <ComplaintsWidget />
      <EventsWidget />
      <AssetWidget />
      <FeedbackWidget />
    </div>
  );
};
```

### Room Allocation System

The room allocation system allows administrators to:
- View all rooms and their occupancy status
- Allocate rooms to residents
- View room history
- Generate room reports

**Room Management Component Example**:

```jsx
// Room allocation component
const RoomAllocation = () => {
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [availableUsers, setAvailableUsers] = useState([]);
  
  const handleRoomSelect = (room) => {
    setSelectedRoom(room);
    // Fetch available users
  };
  
  const handleAllocate = (userId) => {
    // Allocate room to user
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <RoomList onRoomSelect={handleRoomSelect} />
      <UsersList users={availableUsers} onAllocate={handleAllocate} />
    </div>
  );
};
```

### Complaint Management

Residents can submit and track complaints, while administrators can manage and resolve them.

**Complaint Form Example**:

```jsx
// Submit complaint form
const ComplaintForm = () => {
  const categories = ['maintenance', 'cleanliness', 'security', 'other'];
  
  const handleSubmit = (values) => {
    // Submit complaint
  };
  
  return (
    <Formik
      initialValues={{ title: '', description: '', category: '', priority: 'medium' }}
      validationSchema={complaintSchema}
      onSubmit={handleSubmit}
    >
      {/* Form fields */}
    </Formik>
  );
};
```

### Mess Feedback System

The mess feedback system allows residents to rate meals and provide feedback. The system uses AI to analyze sentiment.

**Feedback Form Example**:

```jsx
// Mess feedback form with rating
const MessFeedbackForm = () => {
  const [rating, setRating] = useState(0);
  
  const handleSubmit = (values) => {
    // Submit feedback with rating
  };
  
  return (
    <Formik
      initialValues={{ mealType: 'lunch', feedback: '', date: new Date() }}
      validationSchema={feedbackSchema}
      onSubmit={handleSubmit}
    >
      {/* Form fields */}
      <RatingComponent value={rating} onChange={setRating} />
    </Formik>
  );
};
```

### Community Portal

The community portal allows residents to share announcements, organize events, and build community.

**Community Post Example**:

```jsx
// Create community post
const CommunityPostForm = () => {
  const handleSubmit = (values) => {
    // Create new post
  };
  
  return (
    <Formik
      initialValues={{ title: '', content: '', category: 'announcement' }}
      validationSchema={postSchema}
      onSubmit={handleSubmit}
    >
      {/* Form fields */}
    </Formik>
  );
};
```

## 🔄 Redux State Management

The application uses Redux Toolkit for state management. Main slices include:

- **authSlice**: Manages user authentication state
- **roomsSlice**: Manages room data and allocations
- **complaintsSlice**: Manages complaints data
- **assetsSlice**: Manages asset inventory data
- **messSlice**: Manages mess feedback and menu data
- **communitySlice**: Manages community posts and events

**Example of Redux Usage**:

```jsx
// Using Redux state and actions in a component
import { useSelector, useDispatch } from 'react-redux';
import { fetchComplaints, resolveComplaint } from '../store/slices/complaintsSlice';

const ComplaintsList = () => {
  const dispatch = useDispatch();
  const { complaints, loading, error } = useSelector(state => state.complaints);
  
  useEffect(() => {
    dispatch(fetchComplaints());
  }, [dispatch]);
  
  const handleResolve = (complaintId) => {
    dispatch(resolveComplaint(complaintId));
  };
  
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  
  return (
    <ul>
      {complaints.map(complaint => (
        <ComplaintItem 
          key={complaint.id} 
          complaint={complaint}
          onResolve={() => handleResolve(complaint.id)}
        />
      ))}
    </ul>
  );
};
```

## 📊 Data Visualization

The application uses Chart.js for data visualization. Examples include:

- Occupancy rate charts
- Complaint category distribution
- Monthly mess feedback ratings
- Asset utilization graphs

**Chart Component Example**:

```jsx
// Bar chart for mess feedback ratings
import { Bar } from 'react-chartjs-2';

const MessFeedbackChart = ({ data }) => {
  const chartData = {
    labels: ['Breakfast', 'Lunch', 'Dinner'],
    datasets: [
      {
        label: 'Average Rating',
        data: [data.breakfast, data.lunch, data.dinner],
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
        ],
      },
    ],
  };
  
  return <Bar data={chartData} options={chartOptions} />;
};
```

## 📱 Responsive Design

The frontend is fully responsive, adapting to different screen sizes using TailwindCSS:

```jsx
// Responsive layout example
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <div className="col-span-1 md:col-span-2 lg:col-span-1">
    <OccupancyWidget />
  </div>
  <div className="col-span-1">
    <ComplaintsWidget />
  </div>
  <div className="col-span-1">
    <EventsWidget />
  </div>
</div>
```

## 🧪 Testing

The frontend includes unit and integration tests using React Testing Library and Jest:

```bash
# Run all tests
npm test

# Run specific tests
npm test -- components/Login.test.js
```

**Test Example**:

```jsx
// Login component test
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import store from '../store';
import Login from '../pages/Login';

test('renders login form', () => {
  render(
    <Provider store={store}>
      <Login />
    </Provider>
  );
  
  expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
});
```

## 🚀 Build for Production

```bash
npm run build
# or
yarn build
```

The build artifacts will be stored in the `dist/` directory.

## 🌐 Internationalization

The frontend supports multiple languages using i18next:

```jsx
// Using translations
import { useTranslation } from 'react-i18next';

const Header = () => {
  const { t, i18n } = useTranslation();
  
  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };
  
  return (
    <header>
      <h1>{t('app.title')}</h1>
      <div>
        <button onClick={() => changeLanguage('en')}>English</button>
        <button onClick={() => changeLanguage('es')}>Español</button>
        <button onClick={() => changeLanguage('hi')}>हिन्दी</button>
      </div>
    </header>
  );
};
```

---

For any additional information or troubleshooting, please refer to the main project README or contact the development team. 