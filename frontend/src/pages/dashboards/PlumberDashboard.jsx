import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';

// Components
import DashboardCard from '../../components/DashboardCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import { API_URL } from '../../utils/constants';

const PlumberDashboard = () => {
  const { user, token } = useSelector(state => state.auth);
  const [loading, setLoading] = useState(true);
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState({
    pending: 0,
    inProgress: 0,
    resolved: 0,
    total: 0
  });
  const [message, setMessage] = useState({ type: '', text: '' });

  // Fetch plumbing-related complaints
  useEffect(() => {
    const fetchComplaints = async () => {
      setLoading(true);
      try {
        // The API should filter by category=plumbing automatically for plumbers
        const response = await axios.get(`${API_URL}/api/complaints`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setComplaints(response.data);
        
        // Calculate stats
        const pending = response.data.filter(c => c.status === 'pending').length;
        const inProgress = response.data.filter(c => c.status === 'in_progress').length;
        const resolved = response.data.filter(c => c.status === 'resolved').length;
        
        setStats({
          pending,
          inProgress,
          resolved,
          total: response.data.length
        });
        
      } catch (error) {
        console.error('Error fetching complaints:', error);
        setMessage({ type: 'error', text: 'Failed to load complaints' });
      } finally {
        setLoading(false);
      }
    };

    fetchComplaints();
  }, [token]);

  // Handle complaint status update
  const handleUpdateStatus = async (complaintId, newStatus) => {
    try {
      const response = await axios.put(
        `${API_URL}/api/complaints/${complaintId}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 200) {
        setMessage({ type: 'success', text: `Complaint status updated to ${newStatus}` });
        
        // Update complaints list
        setComplaints(complaints.map(c => c.id === complaintId ? response.data : c));
        
        // Update stats
        const updatedComplaints = complaints.map(c => c.id === complaintId ? { ...c, status: newStatus } : c);
        const pending = updatedComplaints.filter(c => c.status === 'pending').length;
        const inProgress = updatedComplaints.filter(c => c.status === 'in_progress').length;
        const resolved = updatedComplaints.filter(c => c.status === 'resolved').length;
        
        setStats({
          pending,
          inProgress,
          resolved,
          total: updatedComplaints.length
        });
      }
    } catch (error) {
      console.error('Error updating complaint:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.detail || 'Failed to update complaint status' 
      });
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Plumber Dashboard</h1>
      
      {/* Message display */}
      {message.text && (
        <div className={`p-4 rounded-md ${message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {message.text}
        </div>
      )}
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <DashboardCard title="Total Complaints" value={stats.total} />
        <DashboardCard title="Pending" value={stats.pending} bgColor="bg-yellow-100" textColor="text-yellow-800" />
        <DashboardCard title="In Progress" value={stats.inProgress} bgColor="bg-blue-100" textColor="text-blue-800" />
        <DashboardCard title="Resolved" value={stats.resolved} bgColor="bg-green-100" textColor="text-green-800" />
      </div>
      
      {/* Complaints Section */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Plumbing Complaints</h2>
        
        {complaints.length === 0 ? (
          <p className="text-gray-500">No plumbing complaints found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hostel</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reported By</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {complaints.map(complaint => (
                  <tr key={complaint.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      <div className="tooltip" title={complaint.description}>
                        {complaint.title}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                      {complaint.hostel?.replace('_', ' ')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{complaint.location}</td>
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{complaint.user.full_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(complaint.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <select 
                        className="border rounded p-1"
                        value={complaint.status}
                        onChange={(e) => handleUpdateStatus(complaint.id, e.target.value)}
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
      
      {/* Work Calendar or Schedule could be added here */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Guidelines</h2>
        <div className="space-y-4 text-gray-700">
          <div>
            <h3 className="font-medium text-lg">Status Definitions:</h3>
            <ul className="list-disc pl-6 mt-2">
              <li><span className="font-medium">Pending</span>: Complaint has been registered but work has not started.</li>
              <li><span className="font-medium">In Progress</span>: You have started working on the issue.</li>
              <li><span className="font-medium">Resolved</span>: The issue has been fixed.</li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium text-lg">Priority Guidelines:</h3>
            <ul className="list-disc pl-6 mt-2">
              <li><span className="font-medium text-red-600">High Priority</span>: Address immediately. These issues typically involve water leakage, flooding, or complete loss of water supply.</li>
              <li><span className="font-medium text-yellow-600">Medium Priority</span>: Address within 24 hours. These issues may involve slow drains, minor leaks, or partial functionality.</li>
              <li><span className="font-medium text-green-600">Low Priority</span>: Address when possible. These are usually cosmetic issues or minor inconveniences.</li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium text-lg">Contact Information:</h3>
            <p className="mt-2">For maintenance supply requests or additional help, contact the maintenance supervisor at ext. 4567.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlumberDashboard; 