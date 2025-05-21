import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';

const RoomAllocationForm = ({ onAllocate, hostelName }) => {
  const [students, setStudents] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedRoom, setSelectedRoom] = useState('');
  const [selectedBed, setSelectedBed] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const token = useSelector(state => state.auth.token);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch unallocated students for this hostel
        const studentsResponse = await axios.get(`/api/hostels/${hostelName}/students`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { unallocated: true }
        });
        
        // Fetch rooms with available beds for this hostel
        const roomsResponse = await axios.get('/api/rooms', {
          headers: { Authorization: `Bearer ${token}` },
          params: { hostel: hostelName, available: true }
        });
        
        setStudents(studentsResponse.data);
        setRooms(roomsResponse.data);
      } catch (err) {
        setError('Failed to load allocation data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [token, hostelName]);

  const handleRoomChange = (e) => {
    const roomId = e.target.value;
    setSelectedRoom(roomId);
    setSelectedBed(1); // Reset bed selection when room changes
  };

  const getAvailableBeds = () => {
    if (!selectedRoom) return [];
    
    const room = rooms.find(r => r.id.toString() === selectedRoom);
    if (!room) return [];
    
    // Calculate available beds
    const allocatedBeds = room.allocations?.map(a => a.bed_number) || [];
    const availableBeds = [];
    
    for (let i = 1; i <= room.capacity; i++) {
      if (!allocatedBeds.includes(i)) {
        availableBeds.push(i);
      }
    }
    
    return availableBeds;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStudent || !selectedRoom || !selectedBed) {
      setError('Please select a student, room, and bed');
      return;
    }
    
    setLoading(true);
    try {
      const response = await axios.post('/api/rooms/allocations/', {
        user_id: parseInt(selectedStudent),
        room_id: parseInt(selectedRoom),
        bed_number: parseInt(selectedBed),
        start_date: new Date().toISOString(),
        status: 'current'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      onAllocate(response.data);
      
      // Reset form
      setSelectedStudent('');
      setSelectedRoom('');
      setSelectedBed(1);
      setError('');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to allocate room');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Allocate Room</h2>
      
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Student
          </label>
          <select
            value={selectedStudent}
            onChange={(e) => setSelectedStudent(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            disabled={loading || students.length === 0}
          >
            <option value="">Select a student</option>
            {students.map(student => (
              <option key={student.id} value={student.id}>
                {student.full_name} ({student.email})
              </option>
            ))}
          </select>
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Room
          </label>
          <select
            value={selectedRoom}
            onChange={handleRoomChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            disabled={loading || rooms.length === 0}
          >
            <option value="">Select a room</option>
            {rooms.map(room => (
              <option key={room.id} value={room.id}>
                {room.number} - {room.type} ({room.capacity - (room.allocations?.length || 0)} beds available)
              </option>
            ))}
          </select>
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Bed Number
          </label>
          <select
            value={selectedBed}
            onChange={(e) => setSelectedBed(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            disabled={loading || !selectedRoom}
          >
            {getAvailableBeds().map(bed => (
              <option key={bed} value={bed}>
                Bed {bed}
              </option>
            ))}
          </select>
        </div>
        
        <div className="flex items-center justify-between">
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            disabled={loading}
          >
            {loading ? 'Allocating...' : 'Allocate Room'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RoomAllocationForm;