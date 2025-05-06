import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';

// Components
import Navigation from './components/Navigation.jsx';
import Sidebar from './components/Sidebar.jsx';
import Footer from './components/Footer.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

// Pages
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Assets from './pages/Assets.jsx';
import Complaints from './pages/Complaints.jsx';
import Community from './pages/Community.jsx';
import RoomAllocation from './pages/RoomAllocation.jsx';
import MessFeedback from './pages/MessFeedback.jsx';
import Profile from './pages/Profile.jsx';
import AdminPanel from './pages/AdminPanel.jsx';

function App() {
  const { isAuthenticated, user } = useSelector(state => state.auth);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check if we're on the login page
  const isLoginPage = location.pathname === '/login';
  
  // Redirect to login if not authenticated and not already on login page
  useEffect(() => {
    if (!isAuthenticated && !isLoginPage) {
      navigate('/login');
    }
  }, [isAuthenticated, isLoginPage, navigate]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {isAuthenticated && <Navigation />}
      
      <div className="flex flex-1">
        {isAuthenticated && <Sidebar />}
        
        <main className="flex-1 p-5">
          <Routes>
            <Route path="/login" element={<Login />} />
            
            <Route path="/" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/assets" element={
              <ProtectedRoute>
                <Assets />
              </ProtectedRoute>
            } />
            
            <Route path="/complaints" element={
              <ProtectedRoute>
                <Complaints />
              </ProtectedRoute>
            } />
            
            <Route path="/community" element={
              <ProtectedRoute>
                <Community />
              </ProtectedRoute>
            } />
            
            <Route path="/room-allocation" element={
              <ProtectedRoute>
                <RoomAllocation />
              </ProtectedRoute>
            } />
            
            <Route path="/mess-feedback" element={
              <ProtectedRoute>
                <MessFeedback />
              </ProtectedRoute>
            } />
            
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            
            <Route path="/admin" element={
              <ProtectedRoute requiredRole="admin">
                <AdminPanel />
              </ProtectedRoute>
            } />
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
      
      {isAuthenticated && <Footer />}
    </div>
  );
}

export default App;
