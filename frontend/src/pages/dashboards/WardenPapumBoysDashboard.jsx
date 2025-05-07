import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';

// Components
import DashboardCard from '../../components/DashboardCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import { API_URL } from '../../utils/constants';

const WardenPapumBoysDashboard = () => {
  const { user, token } = useSelector(state => state.auth);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [students, setStudents] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [assets, setAssets] = useState([]);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const hostel = "papum_boys";

  // Fetch data specific to this hostel
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Get students in this hostel
        const studentsResponse = await axios.get(`${API_URL}/api/hostels/${hostel}/students`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStudents(studentsResponse.data);

        // Get complaints for this hostel
        const complaintsResponse = await axios.get(`${API_URL}/api/complaints/?hostel=${hostel}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setComplaints(complaintsResponse.data);

        // Get assets for this hostel - assuming there's an API for this
        const assetsResponse = await axios.get(`${API_URL}/api/assets/?location=${hostel}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAssets(assetsResponse.data);

        // Calculate statistics
        const stats = {
          totalStudents: studentsResponse.data.length,
          totalComplaints: complaintsResponse.data.length,
          pendingComplaints: complaintsResponse.data.filter(c => c.status === 'pending').length,
          resolvedComplaints: complaintsResponse.data.filter(c => c.status === 'resolved').length
        };
        setStats(stats);
      } catch (error) {
        console.error('Error fetching data:', error);
        setMessage({ type: 'error', text: 'Failed to load data' });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, hostel]);

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
        
        // Update the complaint in the complaints list
        setComplaints(complaints.map(c => c.id === complaintId ? response.data : c));
        
        // Update stats
        const updatedStats = { ...stats };
        updatedStats.pendingComplaints = complaints.filter(c => c.id !== complaintId && c.status === 'pending').length + (newStatus === 'pending' ? 1 : 0);
        updatedStats.resolvedComplaints = complaints.filter(c => c.id !== complaintId && c.status === 'resolved').length + (newStatus === 'resolved' ? 1 : 0);
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
      <h1 className="text-2xl font-bold text-gray-800">Papum Boys Hostel Dashboard</h1>
      
      {/* Message display */}
      {message.text && (
        <div className={`p-4 rounded-md ${message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {message.text}
        </div>
      )}
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard title="Total Students" value={stats.totalStudents} />
        <DashboardCard title="Total Complaints" value={stats.totalComplaints} />
        <DashboardCard title="Pending Complaints" value={stats.pendingComplaints} />
        <DashboardCard title="Resolved Complaints" value={stats.resolvedComplaints} />
      </div>
      
      {/* Complaints Section */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Recent Complaints</h2>
        {complaints.length === 0 ? (
          <p className="text-gray-500">No complaints found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {complaints.slice(0, 5).map((complaint) => (
                  <tr key={complaint.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{complaint.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{complaint.category}</td>
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
                        <option value="rejected">Rejected</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {complaints.length > 5 && (
              <div className="mt-4 text-right">
                <a href="#" className="text-blue-600 hover:text-blue-800">View all complaints</a>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Students Section */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Students</h2>
        {students.length === 0 ? (
          <p className="text-gray-500">No students found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {students.slice(0, 5).map((student) => (
                  <tr key={student.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{student.full_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.phone_number || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {/* This would come from room allocation data */}
                      Room Allocation Data
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {students.length > 5 && (
              <div className="mt-4 text-right">
                <a href="#" className="text-blue-600 hover:text-blue-800">View all students</a>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Assets Section */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Hostel Assets</h2>
        {assets.length === 0 ? (
          <p className="text-gray-500">No assets found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Condition</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {assets.slice(0, 5).map((asset) => (
                  <tr key={asset.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{asset.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{asset.asset_type}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{asset.status}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{asset.condition}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{asset.location}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {assets.length > 5 && (
              <div className="mt-4 text-right">
                <a href="#" className="text-blue-600 hover:text-blue-800">View all assets</a>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default WardenPapumBoysDashboard; 