import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';

// Components
import DashboardCard from '../../components/DashboardCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import { API_URL } from '../../utils/constants';

const HmcDashboard = () => {
  const { user, token } = useSelector(state => state.auth);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [hostels, setHostels] = useState({
    lohit_girls: { students: 0, capacity: 0 },
    lohit_boys: { students: 0, capacity: 0 },
    papum_boys: { students: 0, capacity: 0 },
    subhanshiri_boys: { students: 0, capacity: 0 }
  });
  const [selectedUser, setSelectedUser] = useState(null);
  const [studentType, setStudentType] = useState('');
  const [selectedWarden, setSelectedWarden] = useState(null);
  const [selectedHostel, setSelectedHostel] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });

  // Fetch users and statistics
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Get all users
        const usersResponse = await axios.get(`${API_URL}/api/users/`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUsers(usersResponse.data);

        // Count students in each hostel
        const hostelData = {
          lohit_girls: { 
            students: usersResponse.data.filter(u => u.hostel === 'lohit_girls').length,
            capacity: 100 // Example capacity
          },
          lohit_boys: { 
            students: usersResponse.data.filter(u => u.hostel === 'lohit_boys').length,
            capacity: 150
          },
          papum_boys: { 
            students: usersResponse.data.filter(u => u.hostel === 'papum_boys').length,
            capacity: 150
          },
          subhanshiri_boys: { 
            students: usersResponse.data.filter(u => u.hostel === 'subhanshiri_boys').length,
            capacity: 100
          }
        };
        setHostels(hostelData);

        // Calculate statistics
        const stats = {
          totalStudents: usersResponse.data.filter(u => u.role === 'student').length,
          unallocatedStudents: usersResponse.data.filter(u => u.role === 'student' && !u.hostel).length,
          totalComplaints: 0, // This would need an API call to get actual data
          pendingComplaints: 0
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
  }, [token]);

  // Handle student hostel allocation
  const handleAllocateHostel = async () => {
    if (!selectedUser || !studentType) {
      setMessage({ type: 'error', text: 'Please select a student and student type' });
      return;
    }

    try {
      const response = await axios.put(
        `${API_URL}/api/users/${selectedUser.id}/allocate-hostel?student_type=${studentType}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 200) {
        setMessage({ type: 'success', text: `Student allocated to ${response.data.hostel} hostel` });
        
        // Update the user in the users list
        setUsers(users.map(u => u.id === selectedUser.id ? response.data : u));
        
        // Update hostel stats
        const updatedHostels = { ...hostels };
        updatedHostels[response.data.hostel].students += 1;
        setHostels(updatedHostels);
        
        // Reset form
        setSelectedUser(null);
        setStudentType('');
      }
    } catch (error) {
      console.error('Error allocating hostel:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.detail || 'Failed to allocate hostel' 
      });
    }
  };

  // Handle warden assignment
  const handleAssignWarden = async () => {
    if (!selectedWarden || !selectedHostel) {
      setMessage({ type: 'error', text: 'Please select a user and hostel' });
      return;
    }

    try {
      const response = await axios.put(
        `${API_URL}/api/users/${selectedWarden.id}/assign-warden?hostel=${selectedHostel}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 200) {
        setMessage({ 
          type: 'success', 
          text: `User assigned as warden for ${selectedHostel.replace('_', ' ')} hostel` 
        });
        
        // Update the user in the users list
        setUsers(users.map(u => u.id === selectedWarden.id ? response.data : u));
        
        // Reset form
        setSelectedWarden(null);
        setSelectedHostel('');
      }
    } catch (error) {
      console.error('Error assigning warden:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.detail || 'Failed to assign warden' 
      });
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">HMC Dashboard</h1>
      
      {/* Message display */}
      {message.text && (
        <div className={`p-4 rounded-md ${message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {message.text}
        </div>
      )}
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard title="Total Students" value={stats.totalStudents} />
        <DashboardCard title="Unallocated Students" value={stats.unallocatedStudents} />
        <DashboardCard title="Total Complaints" value={stats.totalComplaints} />
        <DashboardCard title="Pending Complaints" value={stats.pendingComplaints} />
      </div>
      
      {/* Hostel Occupancy */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Hostel Occupancy</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(hostels).map(([hostel, data]) => (
            <div key={hostel} className="bg-gray-50 p-4 rounded-md">
              <h3 className="text-lg font-medium capitalize">{hostel.replace('_', ' ')}</h3>
              <div className="mt-2">
                <div className="flex justify-between">
                  <span>Occupancy:</span>
                  <span>{data.students}/{data.capacity}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full" 
                    style={{ width: `${(data.students / data.capacity) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Student Allocation Section */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Allocate Student to Hostel</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Student</label>
            <select 
              className="w-full p-2 border rounded"
              value={selectedUser?.id || ''}
              onChange={(e) => {
                const userId = parseInt(e.target.value);
                setSelectedUser(users.find(u => u.id === userId) || null);
              }}
            >
              <option value="">Select a student</option>
              {users
                .filter(u => u.role === 'student' && !u.hostel)
                .map(user => (
                  <option key={user.id} value={user.id}>{user.full_name} ({user.email})</option>
                ))
              }
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Student Type</label>
            <select 
              className="w-full p-2 border rounded"
              value={studentType}
              onChange={(e) => setStudentType(e.target.value)}
            >
              <option value="">Select type</option>
              <option value="female">Female</option>
              <option value="phd_male">PhD Male</option>
              <option value="male">Male</option>
            </select>
          </div>
          <div className="flex items-end">
            <button 
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              onClick={handleAllocateHostel}
            >
              Allocate Hostel
            </button>
          </div>
        </div>
      </div>
      
      {/* Warden Assignment Section */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Assign Warden</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select User</label>
            <select 
              className="w-full p-2 border rounded"
              value={selectedWarden?.id || ''}
              onChange={(e) => {
                const userId = parseInt(e.target.value);
                setSelectedWarden(users.find(u => u.id === userId) || null);
              }}
            >
              <option value="">Select a user</option>
              {users
                .filter(u => !u.role.startsWith('warden_')) // Filter out existing wardens
                .map(user => (
                  <option key={user.id} value={user.id}>{user.full_name} ({user.email})</option>
                ))
              }
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hostel</label>
            <select 
              className="w-full p-2 border rounded"
              value={selectedHostel}
              onChange={(e) => setSelectedHostel(e.target.value)}
            >
              <option value="">Select hostel</option>
              <option value="lohit_girls">Lohit Girls Hostel</option>
              <option value="lohit_boys">Lohit Boys Hostel</option>
              <option value="papum_boys">Papum Boys Hostel</option>
              <option value="subhanshiri_boys">Subhanshiri Boys Hostel</option>
            </select>
          </div>
          <div className="flex items-end">
            <button 
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              onClick={handleAssignWarden}
            >
              Assign Warden
            </button>
          </div>
        </div>
      </div>
      
      {/* Recent Activity or Additional Sections can be added here */}
    </div>
  );
};

export default HmcDashboard; 