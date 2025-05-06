import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../utils/api';

// Async thunks for rooms
export const fetchRooms = createAsyncThunk(
  'rooms/fetchRooms',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (filters.building) params.append('building', filters.building);
      if (filters.floor) params.append('floor', filters.floor);
      if (filters.type) params.append('type', filters.type);
      if (filters.skip) params.append('skip', filters.skip);
      if (filters.limit) params.append('limit', filters.limit);
      
      const response = await api.get(`/api/rooms/?${params.toString()}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const fetchRoomById = createAsyncThunk(
  'rooms/fetchRoomById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/rooms/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const createRoom = createAsyncThunk(
  'rooms/createRoom',
  async (roomData, { rejectWithValue }) => {
    try {
      const response = await api.post('/api/rooms/', roomData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updateRoom = createAsyncThunk(
  'rooms/updateRoom',
  async ({ id, roomData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/api/rooms/${id}`, roomData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const deleteRoom = createAsyncThunk(
  'rooms/deleteRoom',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/api/rooms/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Async thunks for room allocations
export const fetchAllocations = createAsyncThunk(
  'rooms/fetchAllocations',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (filters.room_id) params.append('room_id', filters.room_id);
      if (filters.user_id) params.append('user_id', filters.user_id);
      if (filters.status) params.append('status', filters.status);
      if (filters.skip) params.append('skip', filters.skip);
      if (filters.limit) params.append('limit', filters.limit);
      
      const response = await api.get(`/api/rooms/allocations/?${params.toString()}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const fetchAllocationById = createAsyncThunk(
  'rooms/fetchAllocationById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/rooms/allocations/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const createAllocation = createAsyncThunk(
  'rooms/createAllocation',
  async (allocationData, { rejectWithValue }) => {
    try {
      const response = await api.post('/api/rooms/allocations/', allocationData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updateAllocation = createAsyncThunk(
  'rooms/updateAllocation',
  async ({ id, allocationData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/api/rooms/allocations/${id}`, allocationData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const deleteAllocation = createAsyncThunk(
  'rooms/deleteAllocation',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/api/rooms/allocations/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Initial state
const initialState = {
  rooms: [],
  currentRoom: null,
  allocations: [],
  currentAllocation: null,
  loading: false,
  error: null,
  success: false,
  message: '',
};

// Slice
const roomsSlice = createSlice({
  name: 'rooms',
  initialState,
  reducers: {
    clearRoomsSuccess: (state) => {
      state.success = false;
      state.message = '';
    },
    clearRoomsError: (state) => {
      state.error = null;
    },
    clearCurrentRoom: (state) => {
      state.currentRoom = null;
    },
    clearCurrentAllocation: (state) => {
      state.currentAllocation = null;
    }
  },
  extraReducers: (builder) => {
    // Fetch rooms
    builder.addCase(fetchRooms.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchRooms.fulfilled, (state, action) => {
      state.loading = false;
      state.rooms = action.payload;
    });
    builder.addCase(fetchRooms.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload?.detail || 'Failed to fetch rooms';
    });
    
    // Fetch room by ID
    builder.addCase(fetchRoomById.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchRoomById.fulfilled, (state, action) => {
      state.loading = false;
      state.currentRoom = action.payload;
    });
    builder.addCase(fetchRoomById.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload?.detail || 'Failed to fetch room';
    });
    
    // Create room
    builder.addCase(createRoom.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.success = false;
    });
    builder.addCase(createRoom.fulfilled, (state, action) => {
      state.loading = false;
      state.rooms.unshift(action.payload);
      state.success = true;
      state.message = 'Room created successfully';
    });
    builder.addCase(createRoom.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload?.detail || 'Failed to create room';
    });
    
    // Update room
    builder.addCase(updateRoom.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.success = false;
    });
    builder.addCase(updateRoom.fulfilled, (state, action) => {
      state.loading = false;
      state.rooms = state.rooms.map(room => 
        room.id === action.payload.id ? action.payload : room
      );
      if (state.currentRoom && state.currentRoom.id === action.payload.id) {
        state.currentRoom = action.payload;
      }
      state.success = true;
      state.message = 'Room updated successfully';
    });
    builder.addCase(updateRoom.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload?.detail || 'Failed to update room';
    });
    
    // Delete room
    builder.addCase(deleteRoom.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.success = false;
    });
    builder.addCase(deleteRoom.fulfilled, (state, action) => {
      state.loading = false;
      state.rooms = state.rooms.filter(room => room.id !== action.payload);
      if (state.currentRoom && state.currentRoom.id === action.payload) {
        state.currentRoom = null;
      }
      state.success = true;
      state.message = 'Room deleted successfully';
    });
    builder.addCase(deleteRoom.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload?.detail || 'Failed to delete room';
    });
    
    // Fetch allocations
    builder.addCase(fetchAllocations.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchAllocations.fulfilled, (state, action) => {
      state.loading = false;
      state.allocations = action.payload;
    });
    builder.addCase(fetchAllocations.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload?.detail || 'Failed to fetch allocations';
    });
    
    // Fetch allocation by ID
    builder.addCase(fetchAllocationById.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchAllocationById.fulfilled, (state, action) => {
      state.loading = false;
      state.currentAllocation = action.payload;
    });
    builder.addCase(fetchAllocationById.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload?.detail || 'Failed to fetch allocation';
    });
    
    // Create allocation
    builder.addCase(createAllocation.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.success = false;
    });
    builder.addCase(createAllocation.fulfilled, (state, action) => {
      state.loading = false;
      state.allocations.unshift(action.payload);
      state.success = true;
      state.message = 'Room allocation created successfully';
    });
    builder.addCase(createAllocation.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload?.detail || 'Failed to create room allocation';
    });
    
    // Update allocation
    builder.addCase(updateAllocation.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.success = false;
    });
    builder.addCase(updateAllocation.fulfilled, (state, action) => {
      state.loading = false;
      state.allocations = state.allocations.map(allocation => 
        allocation.id === action.payload.id ? action.payload : allocation
      );
      if (state.currentAllocation && state.currentAllocation.id === action.payload.id) {
        state.currentAllocation = action.payload;
      }
      state.success = true;
      state.message = 'Room allocation updated successfully';
    });
    builder.addCase(updateAllocation.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload?.detail || 'Failed to update room allocation';
    });
    
    // Delete allocation
    builder.addCase(deleteAllocation.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.success = false;
    });
    builder.addCase(deleteAllocation.fulfilled, (state, action) => {
      state.loading = false;
      state.allocations = state.allocations.filter(allocation => allocation.id !== action.payload);
      if (state.currentAllocation && state.currentAllocation.id === action.payload) {
        state.currentAllocation = null;
      }
      state.success = true;
      state.message = 'Room allocation deleted successfully';
    });
    builder.addCase(deleteAllocation.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload?.detail || 'Failed to delete room allocation';
    });
  },
});

export const { 
  clearRoomsSuccess, 
  clearRoomsError, 
  clearCurrentRoom, 
  clearCurrentAllocation 
} = roomsSlice.actions;

export default roomsSlice.reducer;
