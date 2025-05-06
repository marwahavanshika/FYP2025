import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../utils/api';

// Async thunks
export const fetchPosts = createAsyncThunk(
  'community/fetchPosts',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (filters.category) params.append('category', filters.category);
      if (filters.skip) params.append('skip', filters.skip);
      if (filters.limit) params.append('limit', filters.limit);
      
      const response = await api.get(`/api/community/posts/?${params.toString()}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const fetchPostById = createAsyncThunk(
  'community/fetchPostById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/community/posts/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const createPost = createAsyncThunk(
  'community/createPost',
  async (postData, { rejectWithValue }) => {
    try {
      const response = await api.post('/api/community/posts/', postData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updatePost = createAsyncThunk(
  'community/updatePost',
  async ({ id, postData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/api/community/posts/${id}`, postData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const deletePost = createAsyncThunk(
  'community/deletePost',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/api/community/posts/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const createComment = createAsyncThunk(
  'community/createComment',
  async (commentData, { rejectWithValue }) => {
    try {
      const response = await api.post('/api/community/comments/', commentData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const fetchPostComments = createAsyncThunk(
  'community/fetchPostComments',
  async ({ postId, skip = 0, limit = 100 }, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `/api/community/posts/${postId}/comments?skip=${skip}&limit=${limit}`
      );
      return { postId, comments: response.data };
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const deleteComment = createAsyncThunk(
  'community/deleteComment',
  async ({ commentId, postId }, { rejectWithValue }) => {
    try {
      await api.delete(`/api/community/comments/${commentId}`);
      return { commentId, postId };
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Initial state
const initialState = {
  posts: [],
  currentPost: null,
  comments: [],
  loading: false,
  error: null,
  success: false,
  message: '',
};

// Slice
const communitySlice = createSlice({
  name: 'community',
  initialState,
  reducers: {
    clearCommunitySuccess: (state) => {
      state.success = false;
      state.message = '';
    },
    clearCommunityError: (state) => {
      state.error = null;
    },
    clearCurrentPost: (state) => {
      state.currentPost = null;
    }
  },
  extraReducers: (builder) => {
    // Fetch posts
    builder.addCase(fetchPosts.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchPosts.fulfilled, (state, action) => {
      state.loading = false;
      state.posts = action.payload;
    });
    builder.addCase(fetchPosts.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload?.detail || 'Failed to fetch posts';
    });
    
    // Fetch post by ID
    builder.addCase(fetchPostById.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchPostById.fulfilled, (state, action) => {
      state.loading = false;
      state.currentPost = action.payload;
      state.comments = action.payload.comments || [];
    });
    builder.addCase(fetchPostById.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload?.detail || 'Failed to fetch post';
    });
    
    // Create post
    builder.addCase(createPost.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.success = false;
    });
    builder.addCase(createPost.fulfilled, (state, action) => {
      state.loading = false;
      state.posts.unshift(action.payload);
      state.success = true;
      state.message = 'Post created successfully';
    });
    builder.addCase(createPost.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload?.detail || 'Failed to create post';
    });
    
    // Update post
    builder.addCase(updatePost.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.success = false;
    });
    builder.addCase(updatePost.fulfilled, (state, action) => {
      state.loading = false;
      state.posts = state.posts.map(post => 
        post.id === action.payload.id ? action.payload : post
      );
      if (state.currentPost && state.currentPost.id === action.payload.id) {
        state.currentPost = action.payload;
      }
      state.success = true;
      state.message = 'Post updated successfully';
    });
    builder.addCase(updatePost.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload?.detail || 'Failed to update post';
    });
    
    // Delete post
    builder.addCase(deletePost.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.success = false;
    });
    builder.addCase(deletePost.fulfilled, (state, action) => {
      state.loading = false;
      state.posts = state.posts.filter(post => post.id !== action.payload);
      if (state.currentPost && state.currentPost.id === action.payload) {
        state.currentPost = null;
      }
      state.success = true;
      state.message = 'Post deleted successfully';
    });
    builder.addCase(deletePost.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload?.detail || 'Failed to delete post';
    });
    
    // Create comment
    builder.addCase(createComment.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.success = false;
    });
    builder.addCase(createComment.fulfilled, (state, action) => {
      state.loading = false;
      state.comments.push(action.payload);
      if (state.currentPost && state.currentPost.id === action.payload.post_id) {
        if (!state.currentPost.comments) {
          state.currentPost.comments = [];
        }
        state.currentPost.comments.push(action.payload);
      }
      state.success = true;
      state.message = 'Comment added successfully';
    });
    builder.addCase(createComment.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload?.detail || 'Failed to add comment';
    });
    
    // Fetch post comments
    builder.addCase(fetchPostComments.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchPostComments.fulfilled, (state, action) => {
      state.loading = false;
      state.comments = action.payload.comments;
      if (state.currentPost && state.currentPost.id === action.payload.postId) {
        state.currentPost.comments = action.payload.comments;
      }
    });
    builder.addCase(fetchPostComments.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload?.detail || 'Failed to fetch comments';
    });
    
    // Delete comment
    builder.addCase(deleteComment.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.success = false;
    });
    builder.addCase(deleteComment.fulfilled, (state, action) => {
      state.loading = false;
      state.comments = state.comments.filter(comment => comment.id !== action.payload.commentId);
      if (state.currentPost && state.currentPost.id === action.payload.postId && state.currentPost.comments) {
        state.currentPost.comments = state.currentPost.comments.filter(
          comment => comment.id !== action.payload.commentId
        );
      }
      state.success = true;
      state.message = 'Comment deleted successfully';
    });
    builder.addCase(deleteComment.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload?.detail || 'Failed to delete comment';
    });
  },
});

export const { clearCommunitySuccess, clearCommunityError, clearCurrentPost } = communitySlice.actions;
export default communitySlice.reducer;
