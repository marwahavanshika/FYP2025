import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  getUserProfile, 
  updateUserProfile, 
  changePassword,
  clearSuccess,
  clearError
} from '../store/authSlice';

const Profile = () => {
  const dispatch = useDispatch();
  const { user, loading, error, success, message } = useSelector(state => state.auth);
  
  // User profile form state
  const [profileFormData, setProfileFormData] = useState({
    email: '',
    full_name: '',
    phone_number: ''
  });
  
  // Password change form state
  const [passwordFormData, setPasswordFormData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  
  // Validation errors state
  const [validationErrors, setValidationErrors] = useState({
    profile: {},
    password: {}
  });
  
  // Initialize form data when user data is loaded
  useEffect(() => {
    if (!user) {
      dispatch(getUserProfile());
    } else {
      setProfileFormData({
        email: user.email || '',
        full_name: user.full_name || '',
        phone_number: user.phone_number || ''
      });
    }
  }, [dispatch, user]);
  
  // Clear success and error messages after 5 seconds
  useEffect(() => {
    let timer;
    if (success || error) {
      timer = setTimeout(() => {
        dispatch(clearSuccess());
        dispatch(clearError());
      }, 5000);
    }
    return () => clearTimeout(timer);
  }, [success, error, dispatch]);
  
  // Handle profile form input changes
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear validation error for this field if any
    if (validationErrors.profile[name]) {
      setValidationErrors(prev => ({
        ...prev,
        profile: {
          ...prev.profile,
          [name]: ''
        }
      }));
    }
  };
  
  // Handle password form input changes
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear validation error for this field if any
    if (validationErrors.password[name]) {
      setValidationErrors(prev => ({
        ...prev,
        password: {
          ...prev.password,
          [name]: ''
        }
      }));
    }
  };
  
  // Submit profile update form
  const handleProfileSubmit = (e) => {
    e.preventDefault();
    
    // Validate email
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(profileFormData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    // Validate name
    if (!profileFormData.full_name.trim()) {
      errors.full_name = 'Full name is required';
    }
    
    // Check if there are any validation errors
    if (Object.keys(errors).length > 0) {
      setValidationErrors(prev => ({
        ...prev,
        profile: errors
      }));
      return;
    }
    
    // Submit form if validation passes
    dispatch(updateUserProfile(profileFormData));
  };
  
  // Submit password change form
  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    
    // Validate password
    const errors = {};
    if (!passwordFormData.current_password) {
      errors.current_password = 'Current password is required';
    }
    
    if (!passwordFormData.new_password) {
      errors.new_password = 'New password is required';
    } else if (passwordFormData.new_password.length < 8) {
      errors.new_password = 'Password must be at least 8 characters long';
    }
    
    if (passwordFormData.new_password !== passwordFormData.confirm_password) {
      errors.confirm_password = 'Passwords do not match';
    }
    
    // Check if there are any validation errors
    if (Object.keys(errors).length > 0) {
      setValidationErrors(prev => ({
        ...prev,
        password: errors
      }));
      return;
    }
    
    // Submit form if validation passes
    dispatch(changePassword({
      current_password: passwordFormData.current_password,
      new_password: passwordFormData.new_password
    }));
    
    // Clear password form
    setPasswordFormData({
      current_password: '',
      new_password: '',
      confirm_password: ''
    });
  };
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  if (loading && !user) {
    return (
      <div className="flex justify-center items-center h-64">
        <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Your Profile</h1>
      
      {(success || error) && (
        <div className={`mb-4 p-4 rounded-md ${success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message || error}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Summary */}
        <div className="card md:col-span-1">
          <div className="flex flex-col items-center text-center">
            <div className="h-24 w-24 rounded-full bg-blue-600 text-white flex items-center justify-center text-3xl font-bold mb-4">
              {user?.full_name.charAt(0).toUpperCase()}
            </div>
            <h2 className="text-xl font-semibold">{user?.full_name}</h2>
            <p className="text-gray-600">{user?.email}</p>
            <p className="text-gray-600 capitalize mt-1">{user?.role}</p>
            
            <div className="w-full border-t border-gray-200 mt-4 pt-4">
              <div className="flex justify-between mb-2">
                <span className="text-gray-500">Member since:</span>
                <span>{formatDate(user?.created_at)}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-500">Status:</span>
                <span className={`${user?.is_active ? 'text-green-600' : 'text-red-600'}`}>
                  {user?.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Profile Edit Form */}
        <div className="card md:col-span-2">
          <h2 className="card-title">Edit Profile</h2>
          
          <form onSubmit={handleProfileSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="form-group">
                <label htmlFor="full_name" className="label">Full Name</label>
                <input
                  type="text"
                  id="full_name"
                  name="full_name"
                  value={profileFormData.full_name}
                  onChange={handleProfileChange}
                  className={`input ${validationErrors.profile.full_name ? 'border-red-500' : ''}`}
                />
                {validationErrors.profile.full_name && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.profile.full_name}</p>
                )}
              </div>
              
              <div className="form-group">
                <label htmlFor="email" className="label">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={profileFormData.email}
                  onChange={handleProfileChange}
                  className={`input ${validationErrors.profile.email ? 'border-red-500' : ''}`}
                />
                {validationErrors.profile.email && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.profile.email}</p>
                )}
              </div>
              
              <div className="form-group md:col-span-2">
                <label htmlFor="phone_number" className="label">Phone Number</label>
                <input
                  type="text"
                  id="phone_number"
                  name="phone_number"
                  value={profileFormData.phone_number}
                  onChange={handleProfileChange}
                  className="input"
                  placeholder="Optional"
                />
              </div>
            </div>
            
            <div className="flex justify-end">
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Updating...
                  </span>
                ) : 'Update Profile'}
              </button>
            </div>
          </form>
        </div>
        
        {/* Change Password Form */}
        <div className="card md:col-span-3">
          <h2 className="card-title">Change Password</h2>
          
          <form onSubmit={handlePasswordSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="form-group">
                <label htmlFor="current_password" className="label">Current Password</label>
                <input
                  type="password"
                  id="current_password"
                  name="current_password"
                  value={passwordFormData.current_password}
                  onChange={handlePasswordChange}
                  className={`input ${validationErrors.password.current_password ? 'border-red-500' : ''}`}
                />
                {validationErrors.password.current_password && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.password.current_password}</p>
                )}
              </div>
              
              <div className="form-group">
                <label htmlFor="new_password" className="label">New Password</label>
                <input
                  type="password"
                  id="new_password"
                  name="new_password"
                  value={passwordFormData.new_password}
                  onChange={handlePasswordChange}
                  className={`input ${validationErrors.password.new_password ? 'border-red-500' : ''}`}
                />
                {validationErrors.password.new_password && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.password.new_password}</p>
                )}
              </div>
              
              <div className="form-group">
                <label htmlFor="confirm_password" className="label">Confirm New Password</label>
                <input
                  type="password"
                  id="confirm_password"
                  name="confirm_password"
                  value={passwordFormData.confirm_password}
                  onChange={handlePasswordChange}
                  className={`input ${validationErrors.password.confirm_password ? 'border-red-500' : ''}`}
                />
                {validationErrors.password.confirm_password && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.password.confirm_password}</p>
                )}
              </div>
            </div>
            
            <div className="flex justify-end">
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Updating...
                  </span>
                ) : 'Change Password'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
