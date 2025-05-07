import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { logout } from '../store/authSlice';
import { gradients } from '../utils/theme';

const Navigation = () => {
  const { user } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled]);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isProfileOpen && !event.target.closest('.profile-menu')) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileOpen]);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  // Animation variants
  const navbarVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };

  const dropdownVariants = {
    hidden: { opacity: 0, y: -5, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { 
        duration: 0.2,
        ease: "easeOut"
      }
    },
    exit: { 
      opacity: 0, 
      y: -5, 
      scale: 0.95,
      transition: { 
        duration: 0.2,
        ease: "easeIn" 
      }
    }
  };

  const mobileMenuVariants = {
    hidden: { opacity: 0, height: 0 },
    visible: { 
      opacity: 1, 
      height: "auto",
      transition: { 
        duration: 0.3,
        ease: "easeOut"
      }
    },
    exit: { 
      opacity: 0, 
      height: 0,
      transition: { 
        duration: 0.3,
        ease: "easeIn" 
      }
    }
  };

  // Check if a nav link is active
  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <motion.nav 
      initial="hidden"
      animate="visible"
      variants={navbarVariants}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-white text-gray-800 shadow-lg' 
          : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link to="/" className="flex items-center">
                <motion.svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className={`h-8 w-8 mr-2 ${scrolled ? 'text-blue-600' : 'text-white'}`}
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  whileHover={{ rotate: [0, -10, 10, -10, 0], transition: { duration: 0.5 } }}
                >
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                  <polyline points="9 22 9 12 15 12 15 22"></polyline>
                </motion.svg>
                <motion.span 
                  className={`font-bold text-xl ${scrolled ? 'text-gray-800' : 'text-white'}`}
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2, duration: 0.3 }}
                >
                  Hostel Manager
                </motion.span>
              </Link>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                {[
                  { name: 'Dashboard', path: '/' },
                  { name: 'Complaints', path: '/complaints' },
                  { name: 'Community', path: '/community' },
                  { name: 'Rooms', path: '/room-allocation' },
                  { name: 'Mess', path: '/mess-feedback' },
                  ...(user?.role === 'admin' || user?.role === 'staff' ? [{ name: 'Assets', path: '/assets' }] : []),
                  ...(user?.role === 'admin' ? [{ name: 'Admin', path: '/admin' }] : [])
                ].map((item) => (
                  <motion.div key={item.name} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link 
                      to={item.path} 
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                        isActive(item.path)
                          ? scrolled 
                            ? 'bg-blue-100 text-blue-700' 
                            : 'bg-blue-700 text-white'
                          : scrolled
                            ? 'text-gray-700 hover:bg-gray-100'
                            : 'text-white hover:bg-blue-700'
                      }`}
                    >
                      {item.name}
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6">
              <div className="ml-3 relative profile-menu">
                <div>
                  <motion.button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className={`max-w-xs rounded-full flex items-center text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                      scrolled 
                        ? 'bg-blue-100 focus:ring-blue-500' 
                        : 'bg-blue-700 focus:ring-white'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="sr-only">Open user menu</span>
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                      scrolled ? 'bg-blue-500 text-white' : 'bg-blue-800 text-white'
                    }`}>
                      {user?.full_name.charAt(0).toUpperCase()}
                    </div>
                  </motion.button>
                </div>
                <AnimatePresence>
                  {isProfileOpen && (
                    <motion.div 
                      className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 z-10"
                      variants={dropdownVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                    >
                      <div className="block px-4 py-2 text-sm text-gray-700 border-b">
                        <p className="font-medium">{user?.full_name}</p>
                        <p className="text-gray-500">{user?.email}</p>
                        <p className="text-gray-500 capitalize">{user?.role}</p>
                      </div>
                      <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition duration-150">Your Profile</Link>
                      <motion.button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition duration-150"
                        whileHover={{ backgroundColor: '#f3f4f6' }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Sign out
                      </motion.button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
          <div className="-mr-2 flex md:hidden">
            <motion.button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`inline-flex items-center justify-center p-2 rounded-md ${
                scrolled 
                  ? 'text-gray-700 hover:bg-gray-100' 
                  : 'text-white hover:bg-blue-700'
              } focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
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
            </motion.button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            className="md:hidden overflow-hidden"
            variants={mobileMenuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className={`px-2 pt-2 pb-3 space-y-1 sm:px-3 ${
              scrolled ? 'bg-white' : 'bg-blue-600'
            }`}>
              {[
                { name: 'Dashboard', path: '/' },
                { name: 'Complaints', path: '/complaints' },
                { name: 'Community', path: '/community' },
                { name: 'Rooms', path: '/room-allocation' },
                { name: 'Mess', path: '/mess-feedback' },
                ...(user?.role === 'admin' || user?.role === 'staff' ? [{ name: 'Assets', path: '/assets' }] : []),
                ...(user?.role === 'admin' ? [{ name: 'Admin', path: '/admin' }] : [])
              ].map((item, index) => (
                <motion.div 
                  key={item.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link 
                    to={item.path} 
                    className={`block px-3 py-2 rounded-md text-base font-medium ${
                      isActive(item.path)
                        ? scrolled 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'bg-blue-700 text-white'
                        : scrolled
                          ? 'text-gray-700 hover:bg-gray-100'
                          : 'text-white hover:bg-blue-700'
                    }`}
                  >
                    {item.name}
                  </Link>
                </motion.div>
              ))}
            </div>
            <div className={`pt-4 pb-3 border-t ${
              scrolled ? 'border-gray-200 bg-white' : 'border-blue-700 bg-blue-600'
            }`}>
              <div className="flex items-center px-5">
                <div className="flex-shrink-0">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                    scrolled ? 'bg-blue-500 text-white' : 'bg-blue-800 text-white'
                  }`}>
                    {user?.full_name.charAt(0).toUpperCase()}
                  </div>
                </div>
                <div className="ml-3">
                  <div className={`text-base font-medium leading-none ${
                    scrolled ? 'text-gray-800' : 'text-white'
                  }`}>
                    {user?.full_name}
                  </div>
                  <div className={`text-sm font-medium leading-none mt-1 ${
                    scrolled ? 'text-gray-500' : 'text-blue-200'
                  }`}>
                    {user?.email}
                  </div>
                </div>
              </div>
              <div className="mt-3 px-2 space-y-1">
                <Link 
                  to="/profile" 
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    scrolled ? 'text-gray-700 hover:bg-gray-100' : 'text-white hover:bg-blue-700'
                  }`}
                >
                  Your Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium ${
                    scrolled ? 'text-gray-700 hover:bg-gray-100' : 'text-white hover:bg-blue-700'
                  }`}
                >
                  Sign out
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navigation;
