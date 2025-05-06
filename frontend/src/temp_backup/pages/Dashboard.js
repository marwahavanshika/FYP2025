import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchComplaints } from '../store/complaintsSlice';
import { fetchPosts } from '../store/communitySlice';
import { fetchAllocations } from '../store/roomsSlice';
import { fetchMessMenu } from '../store/messSlice';
import { getUserProfile } from '../store/authSlice';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { complaints } = useSelector(state => state.complaints);
  const { posts } = useSelector(state => state.community);
  const { allocations } = useSelector(state => state.rooms);
  const { menuItems } = useSelector(state => state.mess);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch user data if not already loaded
    if (!user) {
      dispatch(getUserProfile());
    }
    
    // Load dashboard data
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          dispatch(fetchComplaints({ limit: 5 })),
          dispatch(fetchPosts({ limit: 5 })),
          dispatch(fetchAllocations({ status: 'current' })),
          dispatch(fetchMessMenu())
        ]);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadDashboardData();
  }, [dispatch, user]);

  // Get today's menu items
  const getTodaysMenu = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = days[new Date().getDay()];
    return menuItems.filter(item => item.day_of_week.toLowerCase() === today.toLowerCase());
  };

  // Get user's current room allocation
  const getCurrentAllocation = () => {
    return allocations.find(allocation => 
      allocation.user_id === user?.id && allocation.status === 'current'
    );
  };

  // Format date in a readable format
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Get priority color class
  const getPriorityClass = (priority) => {
    switch (priority.toLowerCase()) {
      case 'high':
      case 'urgent':
        return 'text-red-600';
      case 'medium':
        return 'text-yellow-600';
      default:
        return 'text-green-600';
    }
  };

  // Get status badge class
  const getStatusBadgeClass = (status) => {
    switch (status.toLowerCase()) {
      case 'resolved':
        return 'badge-success';
      case 'in_progress':
        return 'badge-warning';
      case 'pending':
        return 'badge-info';
      case 'rejected':
        return 'badge-danger';
      default:
        return 'badge-secondary';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  const currentAllocation = getCurrentAllocation();
  const todaysMenu = getTodaysMenu();

  return (
    <div className="container mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* User Info Card */}
        <div className="card bg-gradient-to-br from-blue-50 to-indigo-50">
          <div className="flex items-center">
            <div className="h-16 w-16 rounded-full bg-blue-600 text-white flex items-center justify-center text-xl font-bold">
              {user?.full_name.charAt(0).toUpperCase()}
            </div>
            <div className="ml-4">
              <h2 className="text-xl font-semibold">{user?.full_name}</h2>
              <p className="text-gray-600">{user?.email}</p>
              <p className="text-gray-600 capitalize">{user?.role}</p>
            </div>
          </div>
        </div>
        
        {/* Room Allocation Card */}
        <div className="card">
          <h2 className="card-title">Your Room</h2>
          {currentAllocation ? (
            <div>
              <p className="text-lg font-medium">Room {currentAllocation.room.number}</p>
              <p className="text-gray-600">Building: {currentAllocation.room.building}</p>
              <p className="text-gray-600">Floor: {currentAllocation.room.floor}</p>
              <p className="text-gray-600">Bed: {currentAllocation.bed_number}</p>
              <p className="text-gray-600 mt-2">
                Allocated from: {formatDate(currentAllocation.start_date)}
              </p>
            </div>
          ) : (
            <p className="text-gray-600">You don't have a room allocated yet.</p>
          )}
          <div className="mt-4">
            <Link to="/room-allocation" className="text-blue-600 hover:text-blue-800 font-medium">
              View details →
            </Link>
          </div>
        </div>
        
        {/* Today's Mess Menu Card */}
        <div className="card">
          <h2 className="card-title">Today's Mess Menu</h2>
          {todaysMenu.length > 0 ? (
            <div>
              {todaysMenu.map(item => (
                <div key={item.id} className="mb-3 pb-3 border-b last:border-b-0">
                  <p className="font-medium capitalize">{item.meal_type}</p>
                  <p className="text-gray-600">{item.description}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No menu available for today.</p>
          )}
          <div className="mt-4">
            <Link to="/mess-feedback" className="text-blue-600 hover:text-blue-800 font-medium">
              View full menu & give feedback →
            </Link>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Complaints */}
        <div className="card">
          <h2 className="card-title">Recent Complaints</h2>
          {complaints.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {complaints.map(complaint => (
                    <tr key={complaint.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{complaint.title}</div>
                        <div className="text-sm text-gray-500">{complaint.category}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`badge ${getStatusBadgeClass(complaint.status)} capitalize`}>
                          {complaint.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`font-medium ${getPriorityClass(complaint.priority)} capitalize`}>
                          {complaint.priority}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-600">No complaints found.</p>
          )}
          <div className="mt-4">
            <Link to="/complaints" className="text-blue-600 hover:text-blue-800 font-medium">
              View all complaints →
            </Link>
          </div>
        </div>
        
        {/* Community Posts */}
        <div className="card">
          <h2 className="card-title">Community Updates</h2>
          {posts.length > 0 ? (
            <div className="space-y-4">
              {posts.map(post => (
                <div key={post.id} className="p-4 border rounded-lg hover:bg-gray-50">
                  <h3 className="font-medium text-lg">{post.title}</h3>
                  <div className="flex items-center text-sm text-gray-500 mt-1">
                    <span className="badge badge-info capitalize mr-2">{post.category}</span>
                    <span>Posted by {post.user.full_name}</span>
                    <span className="mx-2">•</span>
                    <span>{formatDate(post.created_at)}</span>
                  </div>
                  <p className="text-gray-600 mt-2 line-clamp-2">{post.content}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No community posts found.</p>
          )}
          <div className="mt-4">
            <Link to="/community" className="text-blue-600 hover:text-blue-800 font-medium">
              View all posts →
            </Link>
          </div>
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <Link to="/complaints" className="card p-4 hover:shadow-lg transition-shadow">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600 mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
            <h3 className="font-medium">File a Complaint</h3>
          </Link>
          
          <Link to="/community" className="card p-4 hover:shadow-lg transition-shadow">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600 mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
            <h3 className="font-medium">Create a Post</h3>
          </Link>
          
          <Link to="/mess-feedback" className="card p-4 hover:shadow-lg transition-shadow">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600 mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
              <line x1="9" y1="9" x2="9.01" y2="9"></line>
              <line x1="15" y1="9" x2="15.01" y2="9"></line>
            </svg>
            <h3 className="font-medium">Give Mess Feedback</h3>
          </Link>
          
          <Link to="/profile" className="card p-4 hover:shadow-lg transition-shadow">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600 mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            <h3 className="font-medium">Update Profile</h3>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
