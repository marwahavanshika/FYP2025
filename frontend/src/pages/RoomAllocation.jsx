import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import RoomAllocationForm from '../components/RoomAllocationForm';

const RoomAllocation = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAllocationForm, setShowAllocationForm] = useState(false);
  
  const { user, token } = useSelector(state => state.auth);
  
  // Determine which hostel this user should see
  const getUserHostel = () => {
    // If user is a warden, extract hostel from role
    if (user.role.startsWith('warden_')) {
      const hostelMap = {
        'warden_lohit_girls': 'lohit_girls',
        'warden_lohit_boys': 'lohit_boys',
        'warden_papum_boys': 'papum_boys',
        'warden_subhanshiri_boys': 'subhanshiri_boys'
      };
      return hostelMap[user.role];
    }
    // For students, return their assigned hostel
    if (user.role === 'student') {
      return user.hostel;
    }
    // Admin and HMC can see all hostels, but we'll default to null
    return null;
  };
  
  const userHostel = getUserHostel();
  
  useEffect(() => {
    const fetchRooms = async () => {
      setLoading(true);
      try {
        // Only filter by hostel if user is a warden or student
        const params = userHostel ? { hostel: userHostel } : {};
        
        const response = await axios.get('/api/rooms', {
          headers: { Authorization: `Bearer ${token}` },
          params
        });
        
        setRooms(response.data);
      } catch (err) {
        setError('Failed to load rooms');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRooms();
  }, [token, userHostel]);
  
  const handleAllocationComplete = () => {
    // Refresh the rooms data after allocation
    setShowAllocationForm(false);
    // Re-fetch rooms
    fetchRooms();
  };
  
  const fetchRooms = async () => {
    setLoading(true);
    try {
      const params = userHostel ? { hostel: userHostel } : {};
      const response = await axios.get('/api/rooms', {
        headers: { Authorization: `Bearer ${token}` },
        params
      });
      setRooms(response.data);
    } catch (err) {
      setError('Failed to load rooms');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  // Group rooms by hostel
  const roomsByHostel = rooms.reduce((acc, room) => {
    if (!acc[room.hostel]) {
      acc[room.hostel] = [];
    }
    acc[room.hostel].push(room);
    return acc;
  }, {});
  
  // Check if user can allocate rooms (admin, HMC, or warden)
  const canAllocateRooms = ['admin', 'hmc'].includes(user.role) || user.role.startsWith('warden_');
  
  if (loading) {
    return <div className="flex justify-center items-center h-64"><div className="loading-spinner"></div></div>;
  }
  
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Room Allocation</h1>
        {canAllocateRooms && (
          <button
            onClick={() => setShowAllocationForm(!showAllocationForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
          >
            {showAllocationForm ? 'Hide Allocation Form' : 'Allocate Room'}
          </button>
        )}
      </div>
      
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
          {error}
        </div>
      )}
      
      {showAllocationForm && canAllocateRooms && (
        <div className="mb-8">
          <RoomAllocationForm 
            onAllocate={handleAllocationComplete} 
            hostelName={userHostel || Object.keys(roomsByHostel)[0]} 
          />
        </div>
      )}
      
      {Object.entries(roomsByHostel).map(([hostel, hostelRooms]) => (
        <div key={hostel} className="mb-8">
          <h2 className="text-xl font-semibold mb-4 capitalize">
            {hostel.replace('_', ' ')} Hostel
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hostelRooms.map(room => {
              // Calculate occupancy
              const occupiedBeds = room.allocations?.length || 0;
              const availableBeds = room.capacity - occupiedBeds;
              
              return (
                <div key={room.id} className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold mb-2">Room {room.number}</h3>
                  <div className="text-gray-600 mb-1">Building: {room.building}</div>
                  <div className="text-gray-600 mb-1">Floor: {room.floor}</div>
                  <div className="text-gray-600 mb-1">Type: {room.type}</div>
                  <div className="text-gray-600 mb-4">Capacity: {room.capacity} beds</div>
                  
                  <div className="mb-2">
                    Availability: {availableBeds} of {room.capacity} beds
                  </div>
                  
                  <div className={`h-2 rounded-full ${
                    availableBeds === 0 ? 'bg-red-500' : 
                    availableBeds < room.capacity / 2 ? 'bg-yellow-500' : 
                    'bg-green-500'
                  }`}></div>
                  
                  {room.allocations && room.allocations.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-medium mb-2">Current Occupants:</h4>
                      <ul className="text-sm">
                        {room.allocations.map(allocation => (
                          <li key={allocation.id} className="mb-1">
                            Bed {allocation.bed_number}: {allocation.user.full_name}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
      
      {Object.keys(roomsByHostel).length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No rooms available to display
        </div>
      )}
    </div>
  );
};

export default RoomAllocation; 