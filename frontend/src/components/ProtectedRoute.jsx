import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, user } = useSelector(state => state.auth);

  if (!isAuthenticated) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" />;
  }
  
  // If a specific role is required, check if the user has that role
  if (requiredRole) {
    // Handle either a single role string or an array of roles
    const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    
    // Always allow admin and HMC to access any route
    if (user?.role === 'admin' || user?.role === 'hmc') {
      return children;
    }
    
    // Check if the user's role is in the allowed roles
    if (!allowedRoles.includes(user?.role)) {
      // Redirect to appropriate dashboard based on role
      switch (user?.role) {
        case 'hmc':
          return <Navigate to="/dashboard/hmc" />;
        case 'warden_lohit_girls':
          return <Navigate to="/dashboard/warden/lohit-girls" />;
        case 'warden_lohit_boys':
          return <Navigate to="/dashboard/warden/lohit-boys" />;
        case 'warden_papum_boys':
          return <Navigate to="/dashboard/warden/papum-boys" />;
        case 'warden_subhanshiri_boys':
          return <Navigate to="/dashboard/warden/subhanshiri-boys" />;
        case 'plumber':
          return <Navigate to="/dashboard/maintenance/plumber" />;
        case 'electrician':
          return <Navigate to="/dashboard/maintenance/electrician" />;
        case 'mess_vendor':
          return <Navigate to="/dashboard/mess" />;
        default:
          // For students and other roles, redirect to main dashboard
          return <Navigate to="/" />;
      }
    }
  }
  
  // If user is authenticated and has the required role (if any), render the children
  return children;
};

export default ProtectedRoute;
