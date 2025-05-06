import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';

// Components
import Navigation from './components/Navigation';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Assets from './pages/Assets';
import Complaints from './pages/Complaints';
import Community from './pages/Community';
import RoomAllocation from './pages/RoomAllocation';
import MessFeedback from './pages/MessFeedback';
import Profile from './pages/Profile';
import AdminPanel from './pages/AdminPanel';

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
