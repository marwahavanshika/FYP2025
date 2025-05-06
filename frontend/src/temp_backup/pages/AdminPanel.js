import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import api from '../utils/api';

// Import user actions
import { registerUser } from '../store/authSlice';

const AdminPanel = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, loading, error, success, message } = useSelector(state => state.auth);
  
  // Check if current user is admin
  useEffect(() => {
    if (user && user.role !== 'admin') {
      navigate('/');
    }
  }, [user, navigate]);
  
  // States for different tabs
  const [activeTab, setActiveTab] = useState('users');
  
  // States for user management
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loadingUsers, setLoadingUsers] = useState(false);
  
  // State for system stats
  const [systemStats, setSystemStats] = useState({
    total_users: 0,
    total_complaints: 0,
    total_posts: 0,
    total_rooms: 0,
    recent_activity: []
  });
  const [loadingStats, setLoadingStats] = useState(false);
  
  // States for new user form
  const [newUserForm, setNewUserForm] = useState({
    email: '',
    full_name: '',
    password: '',
    confirm_password: '',
    phone_number: '',
    role: 'student'
  });
  
  // States for validation errors
  const [formErrors, setFormErrors] = useState({});
  
  // Fetch users
  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const response = await api.get('/api/users/');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoadingUsers(false);
    }
  };
  
  // Fetch system stats
  const fetchSystemStats = async () => {
    setLoadingStats(true);
    try {
      // In a real app, this would be a single API call
      // For this demo, we'll make separate calls and combine the data
      const [usersRes, complaintsRes, postsRes, roomsRes] = await Promise.all([
        api.get('/api/users/'),
        api.get('/api/complaints/'),
        api.get('/api/community/posts/'),
        api.get('/api/rooms/')
      ]);
      
      // Combine recent activity from different sources
      const allActivity = [
        ...complaintsRes.data.map(item => ({
          type: 'complaint',
          title: item.title,
          user: item.user.full_name,
          date: new Date(item.created_at)
        })),
        ...postsRes.data.map(item => ({
          type: 'post',
          title: item.title,
          user: item.user.full_name,
          date: new Date(item.created_at)
        }))
      ];
      
      // Sort by date, newest first
      allActivity.sort((a, b) => b.date - a.date);
      
      setSystemStats({
        total_users: usersRes.data.length,
        total_complaints: complaintsRes.data.length,
        total_posts: postsRes.data.length,
        total_rooms: roomsRes.data.length,
        recent_activity: allActivity.slice(0, 10) // Get 10 most recent activities
      });
    } catch (error) {
      console.error('Error fetching system stats:', error);
    } finally {
      setLoadingStats(false);
    }
  };
  
  // Load initial data
  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    } else if (activeTab === 'dashboard') {
      fetchSystemStats();
    }
  }, [activeTab]);
  
  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };
  
  // Handle new user form changes
  const handleNewUserChange = (e) => {
    const { name, value } = e.target;
    setNewUserForm(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear validation error for this field if any
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  
  // Submit new user form
  const handleNewUserSubmit = (e) => {
    e.preventDefault();
    
    // Validate form
    const errors = {};
    
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newUserForm.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    // Validate name
    if (!newUserForm.full_name.trim()) {
      errors.full_name = 'Full name is required';
    }
    
    // Validate password
    if (!newUserForm.password) {
      errors.password = 'Password is required';
    } else if (newUserForm.password.length < 8) {
      errors.password = 'Password must be at least 8 characters long';
    }
    
    // Validate password confirmation
    if (newUserForm.password !== newUserForm.confirm_password) {
      errors.confirm_password = 'Passwords do not match';
    }
    
    // Check if there are any validation errors
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    // Submit form if validation passes
    dispatch(registerUser({
      email: newUserForm.email,
      full_name: newUserForm.full_name,
      password: newUserForm.password,
      phone_number: newUserForm.phone_number,
      role: newUserForm.role
    }));
    
    // Clear form on successful submission
    if (!error) {
      setNewUserForm({
        email: '',
        full_name: '',
        password: '',
        confirm_password: '',
        phone_number: '',
        role: 'student'
      });
      
      // Refresh user list
      fetchUsers();
    }
  };
  
  // Handle user status toggle
  const handleToggleUserStatus = async (userId, currentStatus) => {
    try {
      await api.put(`/api/users/${userId}`, {
        is_active: !currentStatus
      });
      
      // Refresh user list
      fetchUsers();
    } catch (error) {
      console.error('Error toggling user status:', error);
    }
  };
  
  // Handle user deletion
  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        await api.delete(`/api/users/${userId}`);
        
        // Refresh user list
        fetchUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  return (
    <div className="container mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Admin Panel</h1>
      
      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="flex -mb-px">
          <button
            onClick={() => handleTabChange('dashboard')}
            className={`py-2 px-4 border-b-2 font-medium text-sm ${
              activeTab === 'dashboard'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => handleTabChange('users')}
            className={`ml-6 py-2 px-4 border-b-2 font-medium text-sm ${
              activeTab === 'users'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            User Management
          </button>
        </nav>
      </div>
      
      {/* Success/Error Messages */}
      {(success || error) && (
        <div className={`mb-4 p-4 rounded-md ${success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message || error}
        </div>
      )}
      
      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Stats Cards */}
            <div className="card bg-gradient-to-br from-blue-50 to-indigo-50">
              <h3 className="text-lg font-medium text-gray-800 mb-2">Total Users</h3>
              <p className="text-3xl font-bold text-blue-600">{systemStats.total_users}</p>
            </div>
            
            <div className="card bg-gradient-to-br from-green-50 to-teal-50">
              <h3 className="text-lg font-medium text-gray-800 mb-2">Total Complaints</h3>
              <p className="text-3xl font-bold text-green-600">{systemStats.total_complaints}</p>
            </div>
            
            <div className="card bg-gradient-to-br from-yellow-50 to-amber-50">
              <h3 className="text-lg font-medium text-gray-800 mb-2">Community Posts</h3>
              <p className="text-3xl font-bold text-yellow-600">{systemStats.total_posts}</p>
            </div>
            
            <div className="card bg-gradient-to-br from-purple-50 to-violet-50">
              <h3 className="text-lg font-medium text-gray-800 mb-2">Total Rooms</h3>
              <p className="text-3xl font-bold text-purple-600">{systemStats.total_rooms}</p>
            </div>
          </div>
          
          {/* Recent Activity */}
          <div className="card">
            <h2 className="card-title">Recent Activity</h2>
            
            {loadingStats ? (
              <div className="flex justify-center items-center h-40">
                <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            ) : systemStats.recent_activity.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {systemStats.recent_activity.map((activity, index) => (
                  <div key={index} className="py-3 flex items-start">
                    <div className={`flex-shrink-0 rounded-full p-2 ${
                      activity.type === 'complaint' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                    }`}>
                      {activity.type === 'complaint' ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <div className="ml-3 flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.user} {activity.type === 'complaint' ? 'filed a complaint' : 'created a post'}:
                      </p>
                      <p className="text-sm text-gray-500">{activity.title}</p>
                      <p className="text-xs text-gray-400 mt-1">{formatDate(activity.date)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 py-4 text-center">No recent activity found.</p>
            )}
          </div>
        </div>
      )}
      
      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* User List */}
          <div className="md:col-span-2 card">
            <h2 className="card-title">User Management</h2>
            
            {loadingUsers ? (
              <div className="flex justify-center items-center h-40">
                <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            ) : users.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map(user => (
                      <tr key={user.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{user.full_name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 capitalize">
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {user.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleToggleUserStatus(user.id, user.is_active)}
                            className="text-indigo-600 hover:text-indigo-900 mr-3"
                          >
                            {user.is_active ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 py-4 text-center">No users found.</p>
            )}
          </div>
          
          {/* Add New User Form */}
          <div className="card md:col-span-1">
            <h2 className="card-title">Add New User</h2>
            
            <form onSubmit={handleNewUserSubmit}>
              <div className="space-y-4">
                <div className="form-group">
                  <label htmlFor="email" className="label">Email Address*</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={newUserForm.email}
                    onChange={handleNewUserChange}
                    className={`input ${formErrors.email ? 'border-red-500' : ''}`}
                    required
                  />
                  {formErrors.email && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>
                  )}
                </div>
                
                <div className="form-group">
                  <label htmlFor="full_name" className="label">Full Name*</label>
                  <input
                    type="text"
                    id="full_name"
                    name="full_name"
                    value={newUserForm.full_name}
                    onChange={handleNewUserChange}
                    className={`input ${formErrors.full_name ? 'border-red-500' : ''}`}
                    required
                  />
                  {formErrors.full_name && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.full_name}</p>
                  )}
                </div>
                
                <div className="form-group">
                  <label htmlFor="phone_number" className="label">Phone Number</label>
                  <input
                    type="text"
                    id="phone_number"
                    name="phone_number"
                    value={newUserForm.phone_number}
                    onChange={handleNewUserChange}
                    className="input"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="role" className="label">Role*</label>
                  <select
                    id="role"
                    name="role"
                    value={newUserForm.role}
                    onChange={handleNewUserChange}
                    className="input"
                    required
                  >
                    <option value="student">Student</option>
                    <option value="staff">Staff</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="password" className="label">Password*</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={newUserForm.password}
                    onChange={handleNewUserChange}
                    className={`input ${formErrors.password ? 'border-red-500' : ''}`}
                    required
                  />
                  {formErrors.password && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.password}</p>
                  )}
                </div>
                
                <div className="form-group">
                  <label htmlFor="confirm_password" className="label">Confirm Password*</label>
                  <input
                    type="password"
                    id="confirm_password"
                    name="confirm_password"
                    value={newUserForm.confirm_password}
                    onChange={handleNewUserChange}
                    className={`input ${formErrors.confirm_password ? 'border-red-500' : ''}`}
                    required
                  />
                  {formErrors.confirm_password && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.confirm_password}</p>
                  )}
                </div>
              </div>
              
              <div className="mt-6">
                <button
                  type="submit"
                  className="w-full btn btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Creating...' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
