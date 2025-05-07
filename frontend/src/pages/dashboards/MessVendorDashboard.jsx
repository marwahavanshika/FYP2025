import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';

// Components
import DashboardCard from '../../components/DashboardCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import { API_URL } from '../../utils/constants';

const MessVendorDashboard = () => {
  const { user, token } = useSelector(state => state.auth);
  const [loading, setLoading] = useState(true);
  const [messMenu, setMessMenu] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [messComplaints, setMessComplaints] = useState([]);
  const [stats, setStats] = useState({
    avgRating: 0,
    totalFeedback: 0,
    pendingComplaints: 0,
    resolvedComplaints: 0
  });
  const [message, setMessage] = useState({ type: '', text: '' });

  // Fetch mess data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Get mess menu items
        const menuResponse = await axios.get(`${API_URL}/api/mess-menu/`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMessMenu(menuResponse.data);

        // Get mess feedback
        const feedbackResponse = await axios.get(`${API_URL}/api/mess-feedback/`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setFeedback(feedbackResponse.data);

        // Get mess-related complaints
        const complaintsResponse = await axios.get(`${API_URL}/api/complaints?category=mess`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMessComplaints(complaintsResponse.data);

        // Calculate statistics
        const totalRating = feedbackResponse.data.reduce((sum, item) => sum + item.rating, 0);
        const avgRating = feedbackResponse.data.length > 0 
          ? (totalRating / feedbackResponse.data.length).toFixed(1) 
          : 0;
        
        setStats({
          avgRating,
          totalFeedback: feedbackResponse.data.length,
          pendingComplaints: complaintsResponse.data.filter(c => c.status === 'pending').length,
          resolvedComplaints: complaintsResponse.data.filter(c => c.status === 'resolved').length
        });
      } catch (error) {
        console.error('Error fetching mess data:', error);
        setMessage({ type: 'error', text: 'Failed to load mess data' });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  // Handle complaint status update
  const handleUpdateComplaintStatus = async (complaintId, newStatus) => {
    try {
      const response = await axios.put(
        `${API_URL}/api/complaints/${complaintId}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 200) {
        setMessage({ type: 'success', text: `Complaint status updated to ${newStatus}` });
        
        // Update complaints list
        setMessComplaints(messComplaints.map(c => c.id === complaintId ? response.data : c));
        
        // Update stats
        const updatedStats = { ...stats };
        updatedStats.pendingComplaints = messComplaints.filter(c => c.id !== complaintId && c.status === 'pending').length + (newStatus === 'pending' ? 1 : 0);
        updatedStats.resolvedComplaints = messComplaints.filter(c => c.id !== complaintId && c.status === 'resolved').length + (newStatus === 'resolved' ? 1 : 0);
        setStats(updatedStats);
      }
    } catch (error) {
      console.error('Error updating complaint:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.detail || 'Failed to update complaint' 
      });
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Mess Vendor Dashboard</h1>
      
      {/* Message display */}
      {message.text && (
        <div className={`p-4 rounded-md ${message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {message.text}
        </div>
      )}
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <DashboardCard title="Average Rating" value={stats.avgRating} icon="star" />
        <DashboardCard title="Total Feedback" value={stats.totalFeedback} />
        <DashboardCard title="Pending Complaints" value={stats.pendingComplaints} bgColor="bg-yellow-100" textColor="text-yellow-800" />
        <DashboardCard title="Resolved Complaints" value={stats.resolvedComplaints} bgColor="bg-green-100" textColor="text-green-800" />
      </div>
      
      {/* Mess Menu Section */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Current Menu</h2>
          <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            Edit Menu
          </button>
        </div>
        
        {messMenu.length === 0 ? (
          <p className="text-gray-500">No menu items found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Day</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Meal</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {messMenu.map((menuItem) => (
                  <tr key={menuItem.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{menuItem.day_of_week}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{menuItem.meal_type}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{menuItem.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Recent Feedback Section */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Recent Feedback</h2>
        
        {feedback.length === 0 ? (
          <p className="text-gray-500">No feedback received yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Meal</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comment</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sentiment</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {feedback.slice(0, 5).map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{item.meal_type}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        {Array.from({ length: 5 }).map((_, index) => (
                          <svg 
                            key={index}
                            className={`h-5 w-5 ${index < item.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                            fill="currentColor" 
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{item.comment}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${item.sentiment_score > 0.3 ? 'bg-green-100 text-green-800' : 
                          item.sentiment_score < -0.3 ? 'bg-red-100 text-red-800' : 
                          'bg-yellow-100 text-yellow-800'}`}>
                        {item.sentiment_score > 0.3 ? 'Positive' : 
                          item.sentiment_score < -0.3 ? 'Negative' : 
                          'Neutral'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(item.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {feedback.length > 5 && (
              <div className="mt-4 text-right">
                <a href="#" className="text-blue-600 hover:text-blue-800">View all feedback</a>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Mess Complaints Section */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Mess Complaints</h2>
        
        {messComplaints.length === 0 ? (
          <p className="text-gray-500">No mess complaints found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hostel</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {messComplaints.map((complaint) => (
                  <tr key={complaint.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{complaint.title}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{complaint.description}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                      {complaint.hostel?.replace('_', ' ')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${complaint.status === 'resolved' ? 'bg-green-100 text-green-800' : 
                          complaint.status === 'in_progress' ? 'bg-blue-100 text-blue-800' : 
                          'bg-yellow-100 text-yellow-800'}`}>
                        {complaint.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${complaint.priority === 'high' ? 'bg-red-100 text-red-800' : 
                          complaint.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-green-100 text-green-800'}`}>
                        {complaint.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(complaint.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <select 
                        className="border rounded p-1"
                        value={complaint.status}
                        onChange={(e) => handleUpdateComplaintStatus(complaint.id, e.target.value)}
                      >
                        <option value="pending">Pending</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessVendorDashboard; 