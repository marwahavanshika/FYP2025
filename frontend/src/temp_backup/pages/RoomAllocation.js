import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchRooms, 
  fetchAllocations, 
  createRoom, 
  updateRoom, 
  deleteRoom,
  createAllocation,
  updateAllocation,
  deleteAllocation,
  clearRoomsSuccess,
  clearRoomsError
} from '../store/roomsSlice';

const RoomAllocation = () => {
  const dispatch = useDispatch();
  const { rooms, allocations, loading, error, success, message } = useSelector(state => state.rooms);
  const { user } = useSelector(state => state.auth);
  
  // States for filtering and pagination
  const [roomFilters, setRoomFilters] = useState({
    building: '',
    floor: '',
    type: '',
    skip: 0,
    limit: 10
  });
  
  const [allocationFilters, setAllocationFilters] = useState({
    room_id: '',
    status: 'current',
    skip: 0,
    limit: 10
  });
  
  // States for room form
  const [isRoomFormOpen, setIsRoomFormOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [roomFormData, setRoomFormData] = useState({
    number: '',
    floor: '',
    building: '',
    type: '',
    capacity: ''
  });
  
  // States for allocation form
  const [isAllocationFormOpen, setIsAllocationFormOpen] = useState(false);
  const [editingAllocation, setEditingAllocation] = useState(null);
  const [allocationFormData, setAllocationFormData] = useState({
    user_id: '',
    room_id: '',
    bed_number: '',
    start_date: '',
    end_date: '',
    status: 'current'
  });
  
  // States for user allocation details
  const [userAllocation, setUserAllocation] = useState(null);
  
  // Room type options
  const roomTypeOptions = ['single', 'double', 'triple', 'dormitory'];
  
  // Building options (could be fetched from API in real app)
  const buildingOptions = ['A Block', 'B Block', 'C Block', 'Girls Hostel', 'Boys Hostel'];
  
  // Fetch rooms and allocations on component mount
  useEffect(() => {
    dispatch(fetchRooms(roomFilters));
  }, [dispatch, roomFilters]);
  
  useEffect(() => {
    dispatch(fetchAllocations(allocationFilters));
  }, [dispatch, allocationFilters]);
  
  // Find current user's allocation
  useEffect(() => {
    if (allocations.length > 0 && user) {
      const currentUserAllocation = allocations.find(
        allocation => allocation.user_id === user.id && allocation.status === 'current'
      );
      setUserAllocation(currentUserAllocation);
    }
  }, [allocations, user]);
  
  // Clear success and error messages after 5 seconds
  useEffect(() => {
    let timer;
    if (success || error) {
      timer = setTimeout(() => {
        dispatch(clearRoomsSuccess());
        dispatch(clearRoomsError());
      }, 5000);
    }
    return () => clearTimeout(timer);
  }, [success, error, dispatch]);
  
  // Handle room filter changes
  const handleRoomFilterChange = (e) => {
    const { name, value } = e.target;
    setRoomFilters(prev => ({
      ...prev,
      [name]: value,
      skip: 0 // Reset pagination when filters change
    }));
  };
  
  // Handle allocation filter changes
  const handleAllocationFilterChange = (e) => {
    const { name, value } = e.target;
    setAllocationFilters(prev => ({
      ...prev,
      [name]: value,
      skip: 0 // Reset pagination when filters change
    }));
  };
  
  // Handle room form input changes
  const handleRoomFormChange = (e) => {
    const { name, value } = e.target;
    setRoomFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle allocation form input changes
  const handleAllocationFormChange = (e) => {
    const { name, value } = e.target;
    setAllocationFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Update bed number options if room is changed
    if (name === 'room_id') {
      const selectedRoom = rooms.find(room => room.id === parseInt(value));
      if (selectedRoom) {
        setAllocationFormData(prev => ({
          ...prev,
          bed_number: '1' // Default to first bed
        }));
      }
    }
  };
  
  // Open form for creating a new room
  const openCreateRoomForm = () => {
    setRoomFormData({
      number: '',
      floor: '',
      building: '',
      type: '',
      capacity: ''
    });
    setEditingRoom(null);
    setIsRoomFormOpen(true);
  };
  
  // Open form for editing an existing room
  const openEditRoomForm = (room) => {
    setRoomFormData({
      number: room.number,
      floor: room.floor.toString(),
      building: room.building,
      type: room.type,
      capacity: room.capacity.toString()
    });
    setEditingRoom(room);
    setIsRoomFormOpen(true);
  };
  
  // Close the room form
  const closeRoomForm = () => {
    setIsRoomFormOpen(false);
  };
  
  // Submit the room form
  const handleRoomSubmit = (e) => {
    e.preventDefault();
    
    const roomData = {
      ...roomFormData,
      floor: parseInt(roomFormData.floor),
      capacity: parseInt(roomFormData.capacity)
    };
    
    if (editingRoom) {
      // Update existing room
      dispatch(updateRoom({
        id: editingRoom.id,
        roomData
      }));
    } else {
      // Create new room
      dispatch(createRoom(roomData));
    }
    
    closeRoomForm();
  };
  
  // Open form for creating a new allocation
  const openCreateAllocationForm = (preselectedRoomId = '') => {
    const today = new Date().toISOString().split('T')[0];
    
    setAllocationFormData({
      user_id: '',
      room_id: preselectedRoomId,
      bed_number: '',
      start_date: today,
      end_date: '',
      status: 'current'
    });
    setEditingAllocation(null);
    setIsAllocationFormOpen(true);
  };
  
  // Open form for editing an existing allocation
  const openEditAllocationForm = (allocation) => {
    setAllocationFormData({
      user_id: allocation.user_id.toString(),
      room_id: allocation.room_id.toString(),
      bed_number: allocation.bed_number.toString(),
      start_date: allocation.start_date.split('T')[0],
      end_date: allocation.end_date ? allocation.end_date.split('T')[0] : '',
      status: allocation.status
    });
    setEditingAllocation(allocation);
    setIsAllocationFormOpen(true);
  };
  
  // Close the allocation form
  const closeAllocationForm = () => {
    setIsAllocationFormOpen(false);
  };
  
  // Submit the allocation form
  const handleAllocationSubmit = (e) => {
    e.preventDefault();
    
    const allocationData = {
      ...allocationFormData,
      user_id: parseInt(allocationFormData.user_id),
      room_id: parseInt(allocationFormData.room_id),
      bed_number: parseInt(allocationFormData.bed_number)
    };
    
    if (editingAllocation) {
      // Update existing allocation
      dispatch(updateAllocation({
        id: editingAllocation.id,
        allocationData
      }));
    } else {
      // Create new allocation
      dispatch(createAllocation(allocationData));
    }
    
    closeAllocationForm();
  };
  
  // Delete a room
  const handleDeleteRoom = (roomId) => {
    if (window.confirm('Are you sure you want to delete this room? This action cannot be undone.')) {
      dispatch(deleteRoom(roomId));
    }
  };
  
  // Delete an allocation
  const handleDeleteAllocation = (allocationId) => {
    if (window.confirm('Are you sure you want to end this room allocation?')) {
      dispatch(deleteAllocation(allocationId));
    }
  };
  
  // End a room allocation (change status to 'past' and set end_date)
  const handleEndAllocation = (allocation) => {
    if (window.confirm('Are you sure you want to end this room allocation?')) {
      const today = new Date().toISOString().split('T')[0];
      dispatch(updateAllocation({
        id: allocation.id,
        allocationData: {
          status: 'past',
          end_date: today
        }
      }));
    }
  };
  
  // Format date to readable format
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Get room availability info
  const getRoomAvailability = (roomId) => {
    const roomAllocations = allocations.filter(
      allocation => allocation.room_id === roomId && allocation.status === 'current'
    );
    
    const room = rooms.find(r => r.id === roomId);
    if (!room) return { available: 0, total: 0 };
    
    return {
      available: room.capacity - roomAllocations.length,
      total: room.capacity
    };
  };
  
  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Room Allocation</h1>
        {(user?.role === 'admin' || user?.role === 'staff') && (
          <div className="flex space-x-2">
            <button
              onClick={openCreateRoomForm}
              className="btn btn-primary flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Add Room
            </button>
            <button
              onClick={() => openCreateAllocationForm()}
              className="btn btn-secondary flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              New Allocation
            </button>
          </div>
        )}
      </div>
      
      {(success || error) && (
        <div className={`mb-4 p-4 rounded-md ${success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message || error}
        </div>
      )}
      
      {/* User's Current Room Allocation */}
      {user?.role === 'student' && (
        <div className="card mb-6">
          <h2 className="card-title">Your Room Allocation</h2>
          {userAllocation ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Room Number</p>
                <p className="font-medium">{userAllocation.room.number}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Building</p>
                <p>{userAllocation.room.building}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Floor</p>
                <p>{userAllocation.room.floor}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Bed Number</p>
                <p>{userAllocation.bed_number}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Room Type</p>
                <p className="capitalize">{userAllocation.room.type}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Allocated Since</p>
                <p>{formatDate(userAllocation.start_date)}</p>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">You don't have a room allocated yet. Please contact hostel administration.</p>
          )}
        </div>
      )}
      
      {/* Rooms Management Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Rooms</h2>
          <div className="flex flex-wrap gap-2">
            <select
              name="building"
              value={roomFilters.building}
              onChange={handleRoomFilterChange}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm"
            >
              <option value="">All Buildings</option>
              {buildingOptions.map(building => (
                <option key={building} value={building}>{building}</option>
              ))}
            </select>
            
            <select
              name="type"
              value={roomFilters.type}
              onChange={handleRoomFilterChange}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm"
            >
              <option value="">All Types</option>
              {roomTypeOptions.map(type => (
                <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
              ))}
            </select>
            
            <select
              name="floor"
              value={roomFilters.floor}
              onChange={handleRoomFilterChange}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm"
            >
              <option value="">All Floors</option>
              {[1, 2, 3, 4, 5].map(floor => (
                <option key={floor} value={floor}>Floor {floor}</option>
              ))}
            </select>
          </div>
        </div>
        
        {loading && !isRoomFormOpen && !isAllocationFormOpen ? (
          <div className="flex justify-center items-center h-40">
            <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        ) : rooms.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rooms.map(room => {
              const availability = getRoomAvailability(room.id);
              return (
                <div key={room.id} className="card hover:shadow-md transition duration-200">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-medium">Room {room.number}</h3>
                    {(user?.role === 'admin' || user?.role === 'staff') && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openEditRoomForm(room)}
                          className="p-1 text-blue-600 hover:text-blue-800"
                          title="Edit Room"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteRoom(room.id)}
                          className="p-1 text-red-600 hover:text-red-800"
                          title="Delete Room"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-sm text-gray-500">Building: {room.building}</p>
                    <p className="text-sm text-gray-500">Floor: {room.floor}</p>
                    <p className="text-sm text-gray-500">Type: <span className="capitalize">{room.type}</span></p>
                    <p className="text-sm text-gray-500">Capacity: {room.capacity} beds</p>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium">
                        Availability: {availability.available} of {availability.total} beds
                      </p>
                      <div className="w-32 h-2 bg-gray-200 rounded-full mt-1">
                        <div 
                          className={`h-2 rounded-full ${
                            availability.available === 0 ? 'bg-red-500' : 
                            availability.available < availability.total / 2 ? 'bg-yellow-500' : 
                            'bg-green-500'
                          }`}
                          style={{ width: `${(availability.available / availability.total) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    {(user?.role === 'admin' || user?.role === 'staff') && availability.available > 0 && (
                      <button
                        onClick={() => openCreateAllocationForm(room.id.toString())}
                        className="btn btn-primary btn-sm"
                      >
                        Allocate
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No rooms found. Please adjust your filters or add new rooms.</p>
          </div>
        )}
        
        {/* Pagination for rooms */}
        <div className="flex justify-between items-center mt-4">
          <button
            onClick={() => setRoomFilters(prev => ({ ...prev, skip: Math.max(0, prev.skip - prev.limit) }))}
            disabled={roomFilters.skip === 0}
            className={`btn btn-secondary btn-sm ${roomFilters.skip === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">
            Showing {roomFilters.skip + 1} - {Math.min(roomFilters.skip + roomFilters.limit, roomFilters.skip + rooms.length)} rooms
          </span>
          <button
            onClick={() => setRoomFilters(prev => ({ ...prev, skip: prev.skip + prev.limit }))}
            disabled={rooms.length < roomFilters.limit}
            className={`btn btn-secondary btn-sm ${rooms.length < roomFilters.limit ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Next
          </button>
        </div>
      </div>
      
      {/* Allocations Section - Only visible to admin and staff */}
      {(user?.role === 'admin' || user?.role === 'staff') && (
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Room Allocations</h2>
            <div className="flex flex-wrap gap-2">
              <select
                name="status"
                value={allocationFilters.status}
                onChange={handleAllocationFilterChange}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm"
              >
                <option value="">All Statuses</option>
                <option value="current">Current</option>
                <option value="past">Past</option>
                <option value="cancelled">Cancelled</option>
              </select>
              
              <select
                name="room_id"
                value={allocationFilters.room_id}
                onChange={handleAllocationFilterChange}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm"
              >
                <option value="">All Rooms</option>
                {rooms.map(room => (
                  <option key={room.id} value={room.id}>Room {room.number}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="card">
            <div className="overflow-x-auto">
              {loading && !isRoomFormOpen && !isAllocationFormOpen ? (
                <div className="flex justify-center items-center h-40">
                  <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              ) : allocations.length > 0 ? (
                <table className="table">
                  <thead className="table-header">
                    <tr>
                      <th className="table-header-cell">Student</th>
                      <th className="table-header-cell">Room</th>
                      <th className="table-header-cell">Bed</th>
                      <th className="table-header-cell">Start Date</th>
                      <th className="table-header-cell">End Date</th>
                      <th className="table-header-cell">Status</th>
                      <th className="table-header-cell">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="table-body">
                    {allocations.map(allocation => (
                      <tr key={allocation.id} className="table-row">
                        <td className="table-cell">{allocation.user.full_name}</td>
                        <td className="table-cell">
                          Room {allocation.room.number} ({allocation.room.building})
                        </td>
                        <td className="table-cell">{allocation.bed_number}</td>
                        <td className="table-cell">{formatDate(allocation.start_date)}</td>
                        <td className="table-cell">{allocation.end_date ? formatDate(allocation.end_date) : 'N/A'}</td>
                        <td className="table-cell capitalize">{allocation.status}</td>
                        <td className="table-cell">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => openEditAllocationForm(allocation)}
                              className="p-1 text-blue-600 hover:text-blue-800"
                              title="Edit Allocation"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                              </svg>
                            </button>
                            
                            {allocation.status === 'current' && (
                              <button
                                onClick={() => handleEndAllocation(allocation)}
                                className="p-1 text-yellow-600 hover:text-yellow-800"
                                title="End Allocation"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
                                </svg>
                              </button>
                            )}
                            
                            <button
                              onClick={() => handleDeleteAllocation(allocation.id)}
                              className="p-1 text-red-600 hover:text-red-800"
                              title="Delete Allocation"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No allocations found. Please adjust your filters or create new allocations.</p>
                </div>
              )}
            </div>
            
            {/* Pagination for allocations */}
            <div className="flex justify-between items-center mt-4">
              <button
                onClick={() => setAllocationFilters(prev => ({ ...prev, skip: Math.max(0, prev.skip - prev.limit) }))}
                disabled={allocationFilters.skip === 0}
                className={`btn btn-secondary btn-sm ${allocationFilters.skip === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                Previous
              </button>
              <span className="text-sm text-gray-600">
                Showing {allocationFilters.skip + 1} - {Math.min(allocationFilters.skip + allocationFilters.limit, allocationFilters.skip + allocations.length)} allocations
              </span>
              <button
                onClick={() => setAllocationFilters(prev => ({ ...prev, skip: prev.skip + prev.limit }))}
                disabled={allocations.length < allocationFilters.limit}
                className={`btn btn-secondary btn-sm ${allocations.length < allocationFilters.limit ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Room Form Modal */}
      {isRoomFormOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                {editingRoom ? 'Edit Room' : 'Add New Room'}
              </h2>
              <button onClick={closeRoomForm} className="text-gray-500 hover:text-gray-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleRoomSubmit}>
              <div className="space-y-4">
                <div className="form-group">
                  <label htmlFor="number" className="label">Room Number*</label>
                  <input
                    type="text"
                    id="number"
                    name="number"
                    value={roomFormData.number}
                    onChange={handleRoomFormChange}
                    required
                    className="input"
                    placeholder="e.g. A101"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="building" className="label">Building*</label>
                  <select
                    id="building"
                    name="building"
                    value={roomFormData.building}
                    onChange={handleRoomFormChange}
                    required
                    className="input"
                  >
                    <option value="">Select Building</option>
                    {buildingOptions.map(building => (
                      <option key={building} value={building}>{building}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="floor" className="label">Floor*</label>
                  <input
                    type="number"
                    id="floor"
                    name="floor"
                    value={roomFormData.floor}
                    onChange={handleRoomFormChange}
                    required
                    min="0"
                    max="20"
                    className="input"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="type" className="label">Room Type*</label>
                  <select
                    id="type"
                    name="type"
                    value={roomFormData.type}
                    onChange={handleRoomFormChange}
                    required
                    className="input"
                  >
                    <option value="">Select Type</option>
                    {roomTypeOptions.map(type => (
                      <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="capacity" className="label">Capacity (beds)*</label>
                  <input
                    type="number"
                    id="capacity"
                    name="capacity"
                    value={roomFormData.capacity}
                    onChange={handleRoomFormChange}
                    required
                    min="1"
                    max="12"
                    className="input"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button type="button" onClick={closeRoomForm} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingRoom ? 'Update Room' : 'Create Room'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Allocation Form Modal */}
      {isAllocationFormOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                {editingAllocation ? 'Edit Allocation' : 'New Room Allocation'}
              </h2>
              <button onClick={closeAllocationForm} className="text-gray-500 hover:text-gray-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleAllocationSubmit}>
              <div className="space-y-4">
                <div className="form-group">
                  <label htmlFor="user_id" className="label">Student ID*</label>
                  <input
                    type="number"
                    id="user_id"
                    name="user_id"
                    value={allocationFormData.user_id}
                    onChange={handleAllocationFormChange}
                    required
                    className="input"
                    placeholder="Enter student ID"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="room_id" className="label">Room*</label>
                  <select
                    id="room_id"
                    name="room_id"
                    value={allocationFormData.room_id}
                    onChange={handleAllocationFormChange}
                    required
                    className="input"
                  >
                    <option value="">Select Room</option>
                    {rooms.map(room => (
                      <option key={room.id} value={room.id}>
                        Room {room.number} ({room.building}, {getRoomAvailability(room.id).available} beds available)
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="bed_number" className="label">Bed Number*</label>
                  <input
                    type="number"
                    id="bed_number"
                    name="bed_number"
                    value={allocationFormData.bed_number}
                    onChange={handleAllocationFormChange}
                    required
                    min="1"
                    max={allocationFormData.room_id ? rooms.find(r => r.id.toString() === allocationFormData.room_id)?.capacity || 1 : 1}
                    className="input"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="start_date" className="label">Start Date*</label>
                  <input
                    type="date"
                    id="start_date"
                    name="start_date"
                    value={allocationFormData.start_date}
                    onChange={handleAllocationFormChange}
                    required
                    className="input"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="end_date" className="label">End Date</label>
                  <input
                    type="date"
                    id="end_date"
                    name="end_date"
                    value={allocationFormData.end_date}
                    onChange={handleAllocationFormChange}
                    className="input"
                  />
                  <p className="text-sm text-gray-500 mt-1">Leave blank for ongoing allocation</p>
                </div>
                
                <div className="form-group">
                  <label htmlFor="status" className="label">Status*</label>
                  <select
                    id="status"
                    name="status"
                    value={allocationFormData.status}
                    onChange={handleAllocationFormChange}
                    required
                    className="input"
                  >
                    <option value="current">Current</option>
                    <option value="past">Past</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button type="button" onClick={closeAllocationForm} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingAllocation ? 'Update Allocation' : 'Create Allocation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomAllocation;
