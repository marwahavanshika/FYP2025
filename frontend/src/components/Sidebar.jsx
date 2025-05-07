import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

const Sidebar = () => {
  const location = useLocation();
  const { user } = useSelector(state => state.auth);
  
  // Function to check if a link is active
  const isActiveLink = (path) => {
    return location.pathname === path;
  };

  // Helper to determine if user has one of the warden roles
  const isWarden = user?.role?.startsWith('warden_');
  
  // Helper to determine if user is maintenance staff
  const isMaintenanceStaff = user?.role === 'plumber' || user?.role === 'electrician';
  
  // Get appropriate dashboard path based on role
  const getDashboardPath = () => {
    if (user?.role === 'hmc') return '/dashboard/hmc';
    if (user?.role === 'warden_lohit_girls') return '/dashboard/warden/lohit-girls';
    if (user?.role === 'warden_lohit_boys') return '/dashboard/warden/lohit-boys';
    if (user?.role === 'warden_papum_boys') return '/dashboard/warden/papum-boys';
    if (user?.role === 'warden_subhanshiri_boys') return '/dashboard/warden/subhanshiri-boys';
    if (user?.role === 'plumber') return '/dashboard/maintenance/plumber';
    if (user?.role === 'electrician') return '/dashboard/maintenance/electrician';
    if (user?.role === 'mess_vendor') return '/dashboard/mess';
    return '/'; // Default dashboard
  };

  const dashboardPath = getDashboardPath();

  return (
    <div className="hidden md:flex flex-col w-64 bg-white shadow-md">
      <div className="p-4">
        <h2 className="text-lg font-semibold text-gray-800">Hostel Management</h2>
        <p className="text-sm text-gray-600">Welcome, {user?.full_name}</p>
        <p className="text-xs text-gray-500 capitalize">
          {user?.role?.replace('_', ' ')}
        </p>
      </div>
      <div className="flex-1 overflow-y-auto">
        <nav className="px-2 py-4 space-y-1">
          <Link to={dashboardPath} className={`sidebar-link ${isActiveLink(dashboardPath) ? 'sidebar-link-active' : ''}`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
            Dashboard
          </Link>
          
          {/* Show complaints link to all users */}
          <Link to="/complaints" className={`sidebar-link ${isActiveLink('/complaints') ? 'sidebar-link-active' : ''}`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
            Complaints
          </Link>
          
          {/* Show community link to students, wardens, and HMC */}
          {(user?.role === 'student' || isWarden || user?.role === 'hmc' || user?.role === 'admin') && (
            <Link to="/community" className={`sidebar-link ${isActiveLink('/community') ? 'sidebar-link-active' : ''}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
              Community
            </Link>
          )}
          
          {/* Show room allocation to students, wardens, and HMC */}
          {(user?.role === 'student' || isWarden || user?.role === 'hmc' || user?.role === 'admin') && (
            <Link to="/room-allocation" className={`sidebar-link ${isActiveLink('/room-allocation') ? 'sidebar-link-active' : ''}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
              Room Allocation
            </Link>
          )}
          
          {/* Show mess feedback to all except maintenance staff */}
          {!isMaintenanceStaff && (
            <Link to="/mess-feedback" className={`sidebar-link ${isActiveLink('/mess-feedback') ? 'sidebar-link-active' : ''}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
                <line x1="9" y1="9" x2="9.01" y2="9"></line>
                <line x1="15" y1="9" x2="15.01" y2="9"></line>
              </svg>
              Mess Feedback
            </Link>
          )}
          
          {/* Asset management for admin, HMC, wardens */}
          {(user?.role === 'admin' || user?.role === 'hmc' || isWarden) && (
            <Link to="/assets" className={`sidebar-link ${isActiveLink('/assets') ? 'sidebar-link-active' : ''}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="16.5" y1="9.4" x2="7.5" y2="4.21"></line>
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                <line x1="12" y1="22.08" x2="12" y2="12"></line>
              </svg>
              Asset Management
            </Link>
          )}
          
          {/* Show student management for wardens and HMC */}
          {(isWarden || user?.role === 'hmc' || user?.role === 'admin') && (
            <Link to="/students" className={`sidebar-link ${isActiveLink('/students') ? 'sidebar-link-active' : ''}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
              Students
            </Link>
          )}
          
          {/* Admin panel for admin only */}
          {user?.role === 'admin' && (
            <Link to="/admin" className={`sidebar-link ${isActiveLink('/admin') ? 'sidebar-link-active' : ''}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20h9"></path>
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
              </svg>
              Admin Panel
            </Link>
          )}
          
          {/* HMC-specific user management */}
          {user?.role === 'hmc' && (
            <Link to="/user-management" className={`sidebar-link ${isActiveLink('/user-management') ? 'sidebar-link-active' : ''}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="8.5" cy="7" r="4"></circle>
                <line x1="20" y1="8" x2="20" y2="14"></line>
                <line x1="23" y1="11" x2="17" y2="11"></line>
              </svg>
              User Management
            </Link>
          )}
          
          <div className="pt-4 mt-4 border-t border-gray-200">
            <Link to="/profile" className={`sidebar-link ${isActiveLink('/profile') ? 'sidebar-link-active' : ''}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              Your Profile
            </Link>
          </div>
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
