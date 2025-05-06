import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../utils/api';

// Async thunks for mess menu
export const fetchMessMenu = createAsyncThunk(
  'mess/fetchMessMenu',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (filters.day_of_week) params.append('day_of_week', filters.day_of_week);
      if (filters.meal_type) params.append('meal_type', filters.meal_type);
      if (filters.skip) params.append('skip', filters.skip);
      if (filters.limit) params.append('limit', filters.limit);
      
      const response = await api.get(`/api/mess/menu/?${params.toString()}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const fetchMessMenuItem = createAsyncThunk(
  'mess/fetchMessMenuItem',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/mess/menu/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const createMessMenuItem = createAsyncThunk(
  'mess/createMessMenuItem',
  async (menuData, { rejectWithValue }) => {
    try {
      const response = await api.post('/api/mess/menu/', menuData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updateMessMenuItem = createAsyncThunk(
  'mess/updateMessMenuItem',
  async ({ id, menuData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/api/mess/menu/${id}`, menuData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const deleteMessMenuItem = createAsyncThunk(
  'mess/deleteMessMenuItem',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/api/mess/menu/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Async thunks for mess feedback
export const fetchMessFeedback = createAsyncThunk(
  'mess/fetchMessFeedback',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (filters.meal_type) params.append('meal_type', filters.meal_type);
      if (filters.skip) params.append('skip', filters.skip);
      if (filters.limit) params.append('limit', filters.limit);
      
      const response = await api.get(`/api/mess/feedback/?${params.toString()}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const createMessFeedback = createAsyncThunk(
  'mess/createMessFeedback',
  async (feedbackData, { rejectWithValue }) => {
    try {
      const response = await api.post('/api/mess/feedback/', feedbackData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const fetchMessFeedbackStats = createAsyncThunk(
  'mess/fetchMessFeedbackStats',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (filters.meal_type) params.append('meal_type', filters.meal_type);
      if (filters.days) params.append('days', filters.days);
      
      const response = await api.get(`/api/mess/feedback/stats?${params.toString()}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Initial state
const initialState = {
  menuItems: [],
  currentMenuItem: null,
  feedback: [],
  feedbackStats: null,
  loading: false,
  error: null,
  success: false,
  message: '',
};

// Slice
const messSlice = createSlice({
  name: 'mess',
  initialState,
  reducers: {
    clearMessSuccess: (state) => {
      state.success = false;
      state.message = '';
    },
    clearMessError: (state) => {
      state.error = null;
    },
    clearCurrentMenuItem: (state) => {
      state.currentMenuItem = null;
    }
  },
  extraReducers: (builder) => {
    // Fetch mess menu
    builder.addCase(fetchMessMenu.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchMessMenu.fulfilled, (state, action) => {
      state.loading = false;
      state.menuItems = action.payload;
    });
    builder.addCase(fetchMessMenu.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload?.detail || 'Failed to fetch mess menu';
    });
    
    // Fetch mess menu item
    builder.addCase(fetchMessMenuItem.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchMessMenuItem.fulfilled, (state, action) => {
      state.loading = false;
      state.currentMenuItem = action.payload;
    });
    builder.addCase(fetchMessMenuItem.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload?.detail || 'Failed to fetch menu item';
    });
    
    // Create mess menu item
    builder.addCase(createMessMenuItem.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.success = false;
    });
    builder.addCase(createMessMenuItem.fulfilled, (state, action) => {
      state.loading = false;
      state.menuItems.unshift(action.payload);
      state.success = true;
      state.message = 'Menu item created successfully';
    });
    builder.addCase(createMessMenuItem.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload?.detail || 'Failed to create menu item';
    });
    
    // Update mess menu item
    builder.addCase(updateMessMenuItem.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.success = false;
    });
    builder.addCase(updateMessMenuItem.fulfilled, (state, action) => {
      state.loading = false;
      state.menuItems = state.menuItems.map(item => 
        item.id === action.payload.id ? action.payload : item
      );
      if (state.currentMenuItem && state.currentMenuItem.id === action.payload.id) {
        state.currentMenuItem = action.payload;
      }
      state.success = true;
      state.message = 'Menu item updated successfully';
    });
    builder.addCase(updateMessMenuItem.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload?.detail || 'Failed to update menu item';
    });
    
    // Delete mess menu item
    builder.addCase(deleteMessMenuItem.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.success = false;
    });
    builder.addCase(deleteMessMenuItem.fulfilled, (state, action) => {
      state.loading = false;
      state.menuItems = state.menuItems.filter(item => item.id !== action.payload);
      if (state.currentMenuItem && state.currentMenuItem.id === action.payload) {
        state.currentMenuItem = null;
      }
      state.success = true;
      state.message = 'Menu item deleted successfully';
    });
    builder.addCase(deleteMessMenuItem.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload?.detail || 'Failed to delete menu item';
    });
    
    // Fetch mess feedback
    builder.addCase(fetchMessFeedback.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchMessFeedback.fulfilled, (state, action) => {
      state.loading = false;
      state.feedback = action.payload;
    });
    builder.addCase(fetchMessFeedback.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload?.detail || 'Failed to fetch feedback';
    });
    
    // Create mess feedback
    builder.addCase(createMessFeedback.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.success = false;
    });
    builder.addCase(createMessFeedback.fulfilled, (state, action) => {
      state.loading = false;
      state.feedback.unshift(action.payload);
      state.success = true;
      state.message = 'Feedback submitted successfully';
    });
    builder.addCase(createMessFeedback.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload?.detail || 'Failed to submit feedback';
    });
    
    // Fetch mess feedback stats
    builder.addCase(fetchMessFeedbackStats.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchMessFeedbackStats.fulfilled, (state, action) => {
      state.loading = false;
      state.feedbackStats = action.payload;
    });
    builder.addCase(fetchMessFeedbackStats.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload?.detail || 'Failed to fetch feedback statistics';
    });
  },
});

export const { clearMessSuccess, clearMessError, clearCurrentMenuItem } = messSlice.actions;
export default messSlice.reducer;
