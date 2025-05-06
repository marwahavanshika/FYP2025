import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/authSlice';

const Navigation = () => {
  const { user } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <nav className="bg-blue-600 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link to="/" className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                  <polyline points="9 22 9 12 15 12 15 22"></polyline>
                </svg>
                <span className="font-bold text-xl">Hostel Manager</span>
              </Link>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <Link to="/" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700">Dashboard</Link>
                <Link to="/complaints" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700">Complaints</Link>
                <Link to="/community" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700">Community</Link>
                <Link to="/room-allocation" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700">Rooms</Link>
                <Link to="/mess-feedback" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700">Mess</Link>
                {(user?.role === 'admin' || user?.role === 'staff') && (
                  <Link to="/assets" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700">Assets</Link>
                )}
                {user?.role === 'admin' && (
                  <Link to="/admin" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700">Admin</Link>
                )}
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6">
              <div className="ml-3 relative">
                <div>
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="max-w-xs bg-blue-700 rounded-full flex items-center text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-blue-800 focus:ring-white"
                  >
                    <span className="sr-only">Open user menu</span>
                    <div className="h-8 w-8 rounded-full bg-blue-800 flex items-center justify-center">
                      {user?.full_name.charAt(0).toUpperCase()}
                    </div>
                  </button>
                </div>
                {isProfileOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 z-10">
                    <div className="block px-4 py-2 text-sm text-gray-700 border-b">
                      <p className="font-medium">{user?.full_name}</p>
                      <p className="text-gray-500">{user?.email}</p>
                      <p className="text-gray-500 capitalize">{user?.role}</p>
                    </div>
                    <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Your Profile</Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="bg-blue-700 inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-blue-800 focus:ring-white"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link to="/" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-blue-700">Dashboard</Link>
            <Link to="/complaints" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-blue-700">Complaints</Link>
            <Link to="/community" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-blue-700">Community</Link>
            <Link to="/room-allocation" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-blue-700">Rooms</Link>
            <Link to="/mess-feedback" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-blue-700">Mess</Link>
            {(user?.role === 'admin' || user?.role === 'staff') && (
              <Link to="/assets" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-blue-700">Assets</Link>
            )}
            {user?.role === 'admin' && (
              <Link to="/admin" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-blue-700">Admin</Link>
            )}
          </div>
          <div className="pt-4 pb-3 border-t border-blue-700">
            <div className="flex items-center px-5">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-blue-800 flex items-center justify-center">
                  {user?.full_name.charAt(0).toUpperCase()}
                </div>
              </div>
              <div className="ml-3">
                <div className="text-base font-medium leading-none">{user?.full_name}</div>
                <div className="text-sm font-medium leading-none text-blue-200 mt-1">{user?.email}</div>
              </div>
            </div>
            <div className="mt-3 px-2 space-y-1">
              <Link to="/profile" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-blue-700">Your Profile</Link>
              <button
                onClick={handleLogout}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium hover:bg-blue-700"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
