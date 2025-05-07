import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { AnimatePresence } from 'framer-motion';

// Components
import Navigation from './components/Navigation.jsx';
import Sidebar from './components/Sidebar.jsx';
import Footer from './components/Footer.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import PageTransition from './components/PageTransition.jsx';

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

// New Dashboard Pages
import HmcDashboard from './pages/dashboards/HmcDashboard.jsx';
import WardenLohitGirlsDashboard from './pages/dashboards/WardenLohitGirlsDashboard.jsx';
import WardenLohitBoysDashboard from './pages/dashboards/WardenLohitBoysDashboard.jsx';
import WardenPapumBoysDashboard from './pages/dashboards/WardenPapumBoysDashboard.jsx';
import WardenSubhanshiriBoysDashboard from './pages/dashboards/WardenSubhanshiriBoysDashboard.jsx';
import PlumberDashboard from './pages/dashboards/PlumberDashboard.jsx';
import ElectricianDashboard from './pages/dashboards/ElectricianDashboard.jsx';
import MessVendorDashboard from './pages/dashboards/MessVendorDashboard.jsx';

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

  // Redirect to role-specific dashboard if the user has a role
  useEffect(() => {
    if (isAuthenticated && location.pathname === '/' && user) {
      switch (user.role) {
        case 'hmc':
          navigate('/dashboard/hmc');
          break;
        case 'warden_lohit_girls':
          navigate('/dashboard/warden/lohit-girls');
          break;
        case 'warden_lohit_boys':
          navigate('/dashboard/warden/lohit-boys');
          break;
        case 'warden_papum_boys':
          navigate('/dashboard/warden/papum-boys');
          break;
        case 'warden_subhanshiri_boys':
          navigate('/dashboard/warden/subhanshiri-boys');
          break;
        case 'plumber':
          navigate('/dashboard/maintenance/plumber');
          break;
        case 'electrician':
          navigate('/dashboard/maintenance/electrician');
          break;
        case 'mess_vendor':
          navigate('/dashboard/mess');
          break;
        default:
          // For students and other roles, stay on the main dashboard
          break;
      }
    }
  }, [isAuthenticated, location.pathname, user, navigate]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {isAuthenticated && <Navigation />}
      
      <div className="flex flex-1">
        {isAuthenticated && <Sidebar />}
        
        <main className="flex-1 p-5 ">
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route path="/login" element={<Login />} />
              
              {/* Main Routes */}
              <Route path="/" element={
                <ProtectedRoute>
                  <PageTransition>
                    <Dashboard />
                  </PageTransition>
                </ProtectedRoute>
              } />
              
              <Route path="/assets" element={
                <ProtectedRoute>
                  <PageTransition>
                    <Assets />
                  </PageTransition>
                </ProtectedRoute>
              } />
              
              <Route path="/complaints" element={
                <ProtectedRoute>
                  <PageTransition>
                    <Complaints />
                  </PageTransition>
                </ProtectedRoute>
              } />
              
              <Route path="/community" element={
                <ProtectedRoute>
                  <PageTransition>
                    <Community />
                  </PageTransition>
                </ProtectedRoute>
              } />
              
              <Route path="/room-allocation" element={
                <ProtectedRoute>
                  <PageTransition>
                    <RoomAllocation />
                  </PageTransition>
                </ProtectedRoute>
              } />
              
              <Route path="/mess-feedback" element={
                <ProtectedRoute>
                  <PageTransition>
                    <MessFeedback />
                  </PageTransition>
                </ProtectedRoute>
              } />
              
              <Route path="/profile" element={
                <ProtectedRoute>
                  <PageTransition>
                    <Profile />
                  </PageTransition>
                </ProtectedRoute>
              } />
              
              <Route path="/admin" element={
                <ProtectedRoute requiredRole="admin">
                  <PageTransition>
                    <AdminPanel />
                  </PageTransition>
                </ProtectedRoute>
              } />
              
              {/* Role-specific dashboard routes */}
              <Route path="/dashboard/hmc" element={
                <ProtectedRoute requiredRole="hmc">
                  <PageTransition>
                    <HmcDashboard />
                  </PageTransition>
                </ProtectedRoute>
              } />
              
              <Route path="/dashboard/warden/lohit-girls" element={
                <ProtectedRoute requiredRole="warden_lohit_girls">
                  <PageTransition>
                    <WardenLohitGirlsDashboard />
                  </PageTransition>
                </ProtectedRoute>
              } />
              
              <Route path="/dashboard/warden/lohit-boys" element={
                <ProtectedRoute requiredRole="warden_lohit_boys">
                  <PageTransition>
                    <WardenLohitBoysDashboard />
                  </PageTransition>
                </ProtectedRoute>
              } />
              
              <Route path="/dashboard/warden/papum-boys" element={
                <ProtectedRoute requiredRole="warden_papum_boys">
                  <PageTransition>
                    <WardenPapumBoysDashboard />
                  </PageTransition>
                </ProtectedRoute>
              } />
              
              <Route path="/dashboard/warden/subhanshiri-boys" element={
                <ProtectedRoute requiredRole="warden_subhanshiri_boys">
                  <PageTransition>
                    <WardenSubhanshiriBoysDashboard />
                  </PageTransition>
                </ProtectedRoute>
              } />
              
              <Route path="/dashboard/maintenance/plumber" element={
                <ProtectedRoute requiredRole="plumber">
                  <PageTransition>
                    <PlumberDashboard />
                  </PageTransition>
                </ProtectedRoute>
              } />
              
              <Route path="/dashboard/maintenance/electrician" element={
                <ProtectedRoute requiredRole="electrician">
                  <PageTransition>
                    <ElectricianDashboard />
                  </PageTransition>
                </ProtectedRoute>
              } />
              
              <Route path="/dashboard/mess" element={
                <ProtectedRoute requiredRole="mess_vendor">
                  <PageTransition>
                    <MessVendorDashboard />
                  </PageTransition>
                </ProtectedRoute>
              } />
              
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AnimatePresence>
        </main>
      </div>
      
      {isAuthenticated && <Footer />}
    </div>
  );
}

export default App;
