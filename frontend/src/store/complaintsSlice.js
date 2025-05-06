import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../utils/api';

// Async thunks
export const fetchComplaints = createAsyncThunk(
  'complaints/fetchComplaints',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.category) params.append('category', filters.category);
      if (filters.priority) params.append('priority', filters.priority);
      if (filters.skip) params.append('skip', filters.skip);
      if (filters.limit) params.append('limit', filters.limit);
      
      const response = await api.get(`/api/complaints/?${params.toString()}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const fetchComplaintById = createAsyncThunk(
  'complaints/fetchComplaintById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/complaints/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const createComplaint = createAsyncThunk(
  'complaints/createComplaint',
  async (complaintData, { rejectWithValue }) => {
    try {
      const response = await api.post('/api/complaints/', complaintData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updateComplaint = createAsyncThunk(
  'complaints/updateComplaint',
  async ({ id, complaintData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/api/complaints/${id}`, complaintData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const deleteComplaint = createAsyncThunk(
  'complaints/deleteComplaint',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/api/complaints/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const getSuggestions = createAsyncThunk(
  'complaints/getSuggestions',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/complaints/${id}/suggestions`);
      return { id, suggestions: response.data };
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const createVoiceComplaint = createAsyncThunk(
  'complaints/createVoiceComplaint',
  async (audioData, { rejectWithValue }) => {
    try {
      const response = await api.post('/api/complaints/voice', { audio_data: audioData });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Initial state
const initialState = {
  complaints: [],
  currentComplaint: null,
  loading: false,
  error: null,
  success: false,
  message: '',
  suggestions: [],
};

// Slice
const complaintsSlice = createSlice({
  name: 'complaints',
  initialState,
  reducers: {
    clearComplaintSuccess: (state) => {
      state.success = false;
      state.message = '';
    },
    clearComplaintError: (state) => {
      state.error = null;
    },
    clearCurrentComplaint: (state) => {
      state.currentComplaint = null;
    }
  },
  extraReducers: (builder) => {
    // Fetch complaints
    builder.addCase(fetchComplaints.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchComplaints.fulfilled, (state, action) => {
      state.loading = false;
      state.complaints = action.payload;
    });
    builder.addCase(fetchComplaints.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload?.detail || 'Failed to fetch complaints';
    });
    
    // Fetch complaint by ID
    builder.addCase(fetchComplaintById.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchComplaintById.fulfilled, (state, action) => {
      state.loading = false;
      state.currentComplaint = action.payload;
    });
    builder.addCase(fetchComplaintById.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload?.detail || 'Failed to fetch complaint';
    });
    
    // Create complaint
    builder.addCase(createComplaint.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.success = false;
    });
    builder.addCase(createComplaint.fulfilled, (state, action) => {
      state.loading = false;
      state.complaints.unshift(action.payload);
      state.success = true;
      state.message = 'Complaint created successfully';
    });
    builder.addCase(createComplaint.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload?.detail || 'Failed to create complaint';
    });
    
    // Update complaint
    builder.addCase(updateComplaint.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.success = false;
    });
    builder.addCase(updateComplaint.fulfilled, (state, action) => {
      state.loading = false;
      state.complaints = state.complaints.map(complaint => 
        complaint.id === action.payload.id ? action.payload : complaint
      );
      if (state.currentComplaint && state.currentComplaint.id === action.payload.id) {
        state.currentComplaint = action.payload;
      }
      state.success = true;
      state.message = 'Complaint updated successfully';
    });
    builder.addCase(updateComplaint.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload?.detail || 'Failed to update complaint';
    });
    
    // Delete complaint
    builder.addCase(deleteComplaint.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.success = false;
    });
    builder.addCase(deleteComplaint.fulfilled, (state, action) => {
      state.loading = false;
      state.complaints = state.complaints.filter(complaint => complaint.id !== action.payload);
      if (state.currentComplaint && state.currentComplaint.id === action.payload) {
        state.currentComplaint = null;
      }
      state.success = true;
      state.message = 'Complaint deleted successfully';
    });
    builder.addCase(deleteComplaint.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload?.detail || 'Failed to delete complaint';
    });
    
    // Get suggestions
    builder.addCase(getSuggestions.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(getSuggestions.fulfilled, (state, action) => {
      state.loading = false;
      state.suggestions = action.payload.suggestions;
    });
    builder.addCase(getSuggestions.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload?.detail || 'Failed to get suggestions';
    });
    
    // Create voice complaint
    builder.addCase(createVoiceComplaint.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.success = false;
    });
    builder.addCase(createVoiceComplaint.fulfilled, (state, action) => {
      state.loading = false;
      state.complaints.unshift(action.payload);
      state.success = true;
      state.message = 'Voice complaint created successfully';
    });
    builder.addCase(createVoiceComplaint.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload?.detail || 'Failed to create voice complaint';
    });
  },
});

export const { clearComplaintSuccess, clearComplaintError, clearCurrentComplaint } = complaintsSlice.actions;
export default complaintsSlice.reducer;
