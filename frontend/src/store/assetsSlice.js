import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../utils/api';

// Async thunks
export const fetchAssets = createAsyncThunk(
  'assets/fetchAssets',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (filters.asset_type) params.append('asset_type', filters.asset_type);
      if (filters.status) params.append('status', filters.status);
      if (filters.location) params.append('location', filters.location);
      if (filters.skip) params.append('skip', filters.skip);
      if (filters.limit) params.append('limit', filters.limit);
      
      const response = await api.get(`/api/assets/?${params.toString()}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const fetchAssetById = createAsyncThunk(
  'assets/fetchAssetById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/assets/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const createAsset = createAsyncThunk(
  'assets/createAsset',
  async (assetData, { rejectWithValue }) => {
    try {
      const response = await api.post('/api/assets/', assetData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updateAsset = createAsyncThunk(
  'assets/updateAsset',
  async ({ id, assetData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/api/assets/${id}`, assetData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const deleteAsset = createAsyncThunk(
  'assets/deleteAsset',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/api/assets/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Initial state
const initialState = {
  assets: [],
  currentAsset: null,
  loading: false,
  error: null,
  success: false,
  message: '',
};

// Slice
const assetsSlice = createSlice({
  name: 'assets',
  initialState,
  reducers: {
    clearAssetSuccess: (state) => {
      state.success = false;
      state.message = '';
    },
    clearAssetError: (state) => {
      state.error = null;
    },
    clearCurrentAsset: (state) => {
      state.currentAsset = null;
    }
  },
  extraReducers: (builder) => {
    // Fetch assets
    builder.addCase(fetchAssets.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchAssets.fulfilled, (state, action) => {
      state.loading = false;
      state.assets = action.payload;
    });
    builder.addCase(fetchAssets.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload?.detail || 'Failed to fetch assets';
    });
    
    // Fetch asset by ID
    builder.addCase(fetchAssetById.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchAssetById.fulfilled, (state, action) => {
      state.loading = false;
      state.currentAsset = action.payload;
    });
    builder.addCase(fetchAssetById.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload?.detail || 'Failed to fetch asset';
    });
    
    // Create asset
    builder.addCase(createAsset.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.success = false;
    });
    builder.addCase(createAsset.fulfilled, (state, action) => {
      state.loading = false;
      state.assets.unshift(action.payload);
      state.success = true;
      state.message = 'Asset created successfully';
    });
    builder.addCase(createAsset.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload?.detail || 'Failed to create asset';
    });
    
    // Update asset
    builder.addCase(updateAsset.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.success = false;
    });
    builder.addCase(updateAsset.fulfilled, (state, action) => {
      state.loading = false;
      state.assets = state.assets.map(asset => 
        asset.id === action.payload.id ? action.payload : asset
      );
      if (state.currentAsset && state.currentAsset.id === action.payload.id) {
        state.currentAsset = action.payload;
      }
      state.success = true;
      state.message = 'Asset updated successfully';
    });
    builder.addCase(updateAsset.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload?.detail || 'Failed to update asset';
    });
    
    // Delete asset
    builder.addCase(deleteAsset.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.success = false;
    });
    builder.addCase(deleteAsset.fulfilled, (state, action) => {
      state.loading = false;
      state.assets = state.assets.filter(asset => asset.id !== action.payload);
      if (state.currentAsset && state.currentAsset.id === action.payload) {
        state.currentAsset = null;
      }
      state.success = true;
      state.message = 'Asset deleted successfully';
    });
    builder.addCase(deleteAsset.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload?.detail || 'Failed to delete asset';
    });
  },
});

export const { clearAssetSuccess, clearAssetError, clearCurrentAsset } = assetsSlice.actions;
export default assetsSlice.reducer;
