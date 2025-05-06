import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchPosts, 
  fetchPostById, 
  createPost, 
  updatePost, 
  deletePost,
  createComment,
  deleteComment,
  fetchPostComments,
  clearCommunitySuccess, 
  clearCommunityError 
} from '../store/communitySlice';

const Community = () => {
  const dispatch = useDispatch();
  const { posts, currentPost, comments, loading, error, success, message } = useSelector(state => state.community);
  const { user } = useSelector(state => state.auth);
  
  // States for filtering and pagination
  const [filters, setFilters] = useState({
    category: '',
    skip: 0,
    limit: 10
  });
  
  // States for post form
  const [isPostFormOpen, setIsPostFormOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [postFormData, setPostFormData] = useState({
    title: '',
    content: '',
    category: ''
  });
  
  // States for comment form
  const [commentText, setCommentText] = useState('');
  
  // States for viewing post
  const [viewingPost, setViewingPost] = useState(null);
  
  // Category options
  const categoryOptions = ['announcement', 'discussion', 'event', 'lost_found', 'general'];
  
  // Fetch posts on component mount and when filters change
  useEffect(() => {
    dispatch(fetchPosts(filters));
  }, [dispatch, filters]);
  
  // Clear success and error messages after 5 seconds
  useEffect(() => {
    let timer;
    if (success || error) {
      timer = setTimeout(() => {
        dispatch(clearCommunitySuccess());
        dispatch(clearCommunityError());
      }, 5000);
    }
    return () => clearTimeout(timer);
  }, [success, error, dispatch]);
  
  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value,
      skip: 0 // Reset pagination when filters change
    }));
  };
  
  // Handle post form input changes
  const handlePostInputChange = (e) => {
    const { name, value } = e.target;
    setPostFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Open form for creating a new post
  const openCreatePostForm = () => {
    setPostFormData({
      title: '',
      content: '',
      category: ''
    });
    setEditingPost(null);
    setIsPostFormOpen(true);
  };
  
  // Open form for editing an existing post
  const openEditPostForm = (post) => {
    setPostFormData({
      title: post.title,
      content: post.content,
      category: post.category
    });
    setEditingPost(post);
    setIsPostFormOpen(true);
  };
  
  // Close the post form
  const closePostForm = () => {
    setIsPostFormOpen(false);
  };
  
  // Submit the post form
  const handlePostSubmit = (e) => {
    e.preventDefault();
    
    if (editingPost) {
      // Update existing post
      dispatch(updatePost({
        id: editingPost.id,
        postData: postFormData
      }));
    } else {
      // Create new post
      dispatch(createPost(postFormData));
    }
    
    closePostForm();
  };
  
  // Delete a post
  const handleDeletePost = (postId) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      dispatch(deletePost(postId));
      if (viewingPost && viewingPost.id === postId) {
        setViewingPost(null);
      }
    }
  };
  
  // View post details
  const viewPostDetails = (postId) => {
    dispatch(fetchPostById(postId))
      .unwrap()
      .then(post => {
        setViewingPost(post);
      })
      .catch(error => {
        console.error('Failed to fetch post:', error);
      });
  };
  
  // Close post details
  const closePostDetails = () => {
    setViewingPost(null);
  };
  
  // Submit a comment
  const handleCommentSubmit = (e) => {
    e.preventDefault();
    
    if (!commentText.trim()) return;
    
    dispatch(createComment({
      content: commentText,
      post_id: viewingPost.id
    }));
    
    setCommentText('');
  };
  
  // Delete a comment
  const handleDeleteComment = (commentId) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      dispatch(deleteComment({
        commentId,
        postId: viewingPost.id
      }));
    }
  };
  
  // Format date to readable format
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Get sentiment badge class
  const getSentimentBadgeClass = (score) => {
    if (score === null || score === undefined) return 'badge-secondary';
    if (score > 0.2) return 'badge-success';
    if (score < -0.2) return 'badge-danger';
    return 'badge-info';
  };
  
  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Community Forum</h1>
        <button
          onClick={openCreatePostForm}
          className="btn btn-primary flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Create Post
        </button>
      </div>
      
      {(success || error) && (
        <div className={`mb-4 p-4 rounded-md ${success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message || error}
        </div>
      )}
      
      {/* Filters */}
      <div className="card mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <span className="text-gray-700 font-medium">Filter by:</span>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilters(prev => ({ ...prev, category: '', skip: 0 }))}
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                filters.category === '' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            {categoryOptions.map(category => (
              <button
                key={category}
                onClick={() => setFilters(prev => ({ ...prev, category, skip: 0 }))}
                className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${
                  filters.category === category ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                {category.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Posts List */}
      <div className="space-y-6">
        {loading && !viewingPost ? (
          <div className="flex justify-center items-center h-40">
            <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        ) : posts.length > 0 ? (
          posts.map(post => (
            <div key={post.id} className="card hover:shadow-md transition duration-200">
              <div className="flex justify-between">
                <div>
                  <h2 className="text-xl font-semibold mb-2">{post.title}</h2>
                  <div className="flex items-center text-sm text-gray-500 mb-3">
                    <span className="badge badge-info capitalize mr-2">{post.category.replace('_', ' ')}</span>
                    <span>By {post.user.full_name}</span>
                    <span className="mx-2">•</span>
                    <span>{formatDate(post.created_at)}</span>
                    {post.sentiment_score !== null && (
                      <>
                        <span className="mx-2">•</span>
                        <span className={`badge ${getSentimentBadgeClass(post.sentiment_score)}`}>
                          {post.sentiment_score > 0.2 ? 'Positive' : 
                           post.sentiment_score < -0.2 ? 'Negative' : 'Neutral'}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                
                {(user?.id === post.user_id || user?.role === 'admin' || user?.role === 'staff') && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => openEditPostForm(post)}
                      className="p-1 text-blue-600 hover:text-blue-800"
                      title="Edit"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeletePost(post.id)}
                      className="p-1 text-red-600 hover:text-red-800"
                      title="Delete"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
              
              <p className="text-gray-700 mb-4 line-clamp-3">{post.content}</p>
              
              <div className="flex justify-between items-center">
                <button
                  onClick={() => viewPostDetails(post.id)}
                  className="text-blue-600 hover:text-blue-800 font-medium flex items-center"
                >
                  Read more 
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                
                <div className="flex items-center text-gray-500 text-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                  {post.comments ? post.comments.length : 0} comments
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No posts found. Please adjust your filters or create a new post.</p>
          </div>
        )}
      </div>
      
      {/* Pagination */}
      <div className="flex justify-between items-center mt-6">
        <button
          onClick={() => setFilters(prev => ({ ...prev, skip: Math.max(0, prev.skip - prev.limit) }))}
          disabled={filters.skip === 0}
          className={`btn btn-secondary ${filters.skip === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          Previous
        </button>
        <span className="text-gray-600">
          Showing {filters.skip + 1} - {Math.min(filters.skip + filters.limit, filters.skip + posts.length)} posts
        </span>
        <button
          onClick={() => setFilters(prev => ({ ...prev, skip: prev.skip + prev.limit }))}
          disabled={posts.length < filters.limit}
          className={`btn btn-secondary ${posts.length < filters.limit ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          Next
        </button>
      </div>
      
      {/* Post Form Modal */}
      {isPostFormOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                {editingPost ? 'Edit Post' : 'Create New Post'}
              </h2>
              <button onClick={closePostForm} className="text-gray-500 hover:text-gray-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handlePostSubmit}>
              <div className="space-y-4">
                <div className="form-group">
                  <label htmlFor="title" className="label">Title*</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={postFormData.title}
                    onChange={handlePostInputChange}
                    required
                    className="input"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="category" className="label">Category*</label>
                  <select
                    id="category"
                    name="category"
                    value={postFormData.category}
                    onChange={handlePostInputChange}
                    required
                    className="input"
                  >
                    <option value="">Select Category</option>
                    {categoryOptions.map(category => (
                      <option key={category} value={category}>
                        {category.replace('_', ' ').charAt(0).toUpperCase() + category.replace('_', ' ').slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="content" className="label">Content*</label>
                  <textarea
                    id="content"
                    name="content"
                    value={postFormData.content}
                    onChange={handlePostInputChange}
                    required
                    rows="8"
                    className="input"
                  ></textarea>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button type="button" onClick={closePostForm} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingPost ? 'Update Post' : 'Create Post'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* View Post Modal */}
      {viewingPost && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">{viewingPost.title}</h2>
              <button onClick={closePostDetails} className="text-gray-500 hover:text-gray-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="flex items-center text-sm text-gray-500 mb-4">
              <span className="badge badge-info capitalize mr-2">{viewingPost.category.replace('_', ' ')}</span>
              <span>By {viewingPost.user.full_name}</span>
              <span className="mx-2">•</span>
              <span>{formatDate(viewingPost.created_at)}</span>
              {viewingPost.sentiment_score !== null && (
                <>
                  <span className="mx-2">•</span>
                  <span className={`badge ${getSentimentBadgeClass(viewingPost.sentiment_score)}`}>
                    {viewingPost.sentiment_score > 0.2 ? 'Positive' : 
                     viewingPost.sentiment_score < -0.2 ? 'Negative' : 'Neutral'}
                  </span>
                </>
              )}
            </div>
            
            <div className="prose max-w-none mb-8">
              <p className="whitespace-pre-line">{viewingPost.content}</p>
            </div>
            
            <div className="my-6 border-t border-b py-4">
              <h3 className="text-lg font-medium mb-4">Comments ({viewingPost.comments ? viewingPost.comments.length : 0})</h3>
              
              {viewingPost.comments && viewingPost.comments.length > 0 ? (
                <div className="space-y-4">
                  {viewingPost.comments.map(comment => (
                    <div key={comment.id} className="p-4 bg-gray-50 rounded-md">
                      <div className="flex justify-between">
                        <div className="flex items-center mb-2">
                          <div className="font-medium">{comment.user.full_name}</div>
                          <span className="mx-2 text-gray-400">•</span>
                          <div className="text-sm text-gray-500">{formatDate(comment.created_at)}</div>
                        </div>
                        
                        {(user?.id === comment.user_id || user?.role === 'admin' || user?.role === 'staff') && (
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            className="text-red-500 hover:text-red-700"
                            title="Delete comment"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>
                      <p className="text-gray-700">{comment.content}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No comments yet. Be the first to comment!</p>
              )}
              
              <form onSubmit={handleCommentSubmit} className="mt-6">
                <div className="form-group">
                  <label htmlFor="comment" className="label">Add a comment</label>
                  <textarea
                    id="comment"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    required
                    rows="3"
                    className="input"
                    placeholder="Write your comment here..."
                  ></textarea>
                </div>
                
                <div className="mt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={!commentText.trim()}
                    className={`btn btn-primary ${!commentText.trim() ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    Post Comment
                  </button>
                </div>
              </form>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button onClick={closePostDetails} className="btn btn-secondary">
                Close
              </button>
              
              {(user?.id === viewingPost.user_id || user?.role === 'admin' || user?.role === 'staff') && (
                <button
                  onClick={() => {
                    closePostDetails();
                    openEditPostForm(viewingPost);
                  }}
                  className="btn btn-primary"
                >
                  Edit
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Community;
