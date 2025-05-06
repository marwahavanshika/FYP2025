import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchMessMenu, 
  fetchMessFeedback, 
  createMessFeedback, 
  createMessMenuItem,
  updateMessMenuItem,
  deleteMessMenuItem,
  fetchMessFeedbackStats,
  clearMessSuccess,
  clearMessError
} from '../store/messSlice';

const MessFeedback = () => {
  const dispatch = useDispatch();
  const { menuItems, feedback, feedbackStats, loading, error, success, message } = useSelector(state => state.mess);
  const { user } = useSelector(state => state.auth);
  
  // States for filtering
  const [menuFilters, setMenuFilters] = useState({
    day_of_week: getCurrentDay(),
    meal_type: '',
  });
  
  const [feedbackFilters, setFeedbackFilters] = useState({
    meal_type: '',
    skip: 0,
    limit: 10
  });
  
  // State for statistics
  const [statsFilters, setStatsFilters] = useState({
    meal_type: '',
    days: 30
  });
  
  // States for menu item form
  const [isMenuFormOpen, setIsMenuFormOpen] = useState(false);
  const [editingMenuItem, setEditingMenuItem] = useState(null);
  const [menuFormData, setMenuFormData] = useState({
    day_of_week: '',
    meal_type: '',
    description: ''
  });
  
  // States for feedback form
  const [isFeedbackFormOpen, setIsFeedbackFormOpen] = useState(false);
  const [feedbackFormData, setFeedbackFormData] = useState({
    rating: 5,
    comment: '',
    meal_type: ''
  });
  
  // Day of week options
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  // Meal type options
  const mealTypes = ['breakfast', 'lunch', 'dinner', 'snacks'];
  
  // Get current day of week
  function getCurrentDay() {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[new Date().getDay()];
  }
  
  // Fetch menu items, feedback, and stats on component mount
  useEffect(() => {
    dispatch(fetchMessMenu(menuFilters));
  }, [dispatch, menuFilters]);
  
  useEffect(() => {
    dispatch(fetchMessFeedback(feedbackFilters));
  }, [dispatch, feedbackFilters]);
  
  useEffect(() => {
    if (user?.role === 'admin' || user?.role === 'staff') {
      dispatch(fetchMessFeedbackStats(statsFilters));
    }
  }, [dispatch, statsFilters, user?.role]);
  
  // Clear success and error messages after 5 seconds
  useEffect(() => {
    let timer;
    if (success || error) {
      timer = setTimeout(() => {
        dispatch(clearMessSuccess());
        dispatch(clearMessError());
      }, 5000);
    }
    return () => clearTimeout(timer);
  }, [success, error, dispatch]);
  
  // Handle menu filter changes
  const handleMenuFilterChange = (e) => {
    const { name, value } = e.target;
    setMenuFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle feedback filter changes
  const handleFeedbackFilterChange = (e) => {
    const { name, value } = e.target;
    setFeedbackFilters(prev => ({
      ...prev,
      [name]: value,
      skip: 0 // Reset pagination when filters change
    }));
  };
  
  // Handle stats filter changes
  const handleStatsFilterChange = (e) => {
    const { name, value } = e.target;
    setStatsFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle menu form input changes
  const handleMenuFormChange = (e) => {
    const { name, value } = e.target;
    setMenuFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle feedback form input changes
  const handleFeedbackFormChange = (e) => {
    const { name, value } = e.target;
    setFeedbackFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Open form for creating a new menu item
  const openCreateMenuForm = () => {
    setMenuFormData({
      day_of_week: '',
      meal_type: '',
      description: ''
    });
    setEditingMenuItem(null);
    setIsMenuFormOpen(true);
  };
  
  // Open form for editing an existing menu item
  const openEditMenuForm = (menuItem) => {
    setMenuFormData({
      day_of_week: menuItem.day_of_week,
      meal_type: menuItem.meal_type,
      description: menuItem.description
    });
    setEditingMenuItem(menuItem);
    setIsMenuFormOpen(true);
  };
  
  // Close the menu form
  const closeMenuForm = () => {
    setIsMenuFormOpen(false);
  };
  
  // Submit the menu form
  const handleMenuSubmit = (e) => {
    e.preventDefault();
    
    if (editingMenuItem) {
      // Update existing menu item
      dispatch(updateMessMenuItem({
        id: editingMenuItem.id,
        menuData: menuFormData
      }));
    } else {
      // Create new menu item
      dispatch(createMessMenuItem(menuFormData));
    }
    
    closeMenuForm();
  };
  
  // Delete a menu item
  const handleDeleteMenuItem = (menuItemId) => {
    if (window.confirm('Are you sure you want to delete this menu item?')) {
      dispatch(deleteMessMenuItem(menuItemId));
    }
  };
  
  // Open form for submitting feedback
  const openFeedbackForm = (mealType = '') => {
    setFeedbackFormData({
      rating: 5,
      comment: '',
      meal_type: mealType
    });
    setIsFeedbackFormOpen(true);
  };
  
  // Close the feedback form
  const closeFeedbackForm = () => {
    setIsFeedbackFormOpen(false);
  };
  
  // Submit the feedback form
  const handleFeedbackSubmit = (e) => {
    e.preventDefault();
    
    dispatch(createMessFeedback(feedbackFormData));
    
    closeFeedbackForm();
  };
  
  // Handle star rating click
  const handleStarClick = (rating) => {
    setFeedbackFormData(prev => ({ ...prev, rating }));
  };
  
  // Format date to readable format
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Get sentiment color class
  const getSentimentClass = (score) => {
    if (score === null || score === undefined) return 'sentiment-neutral';
    if (score > 0.2) return 'sentiment-positive';
    if (score < -0.2) return 'sentiment-negative';
    return 'sentiment-neutral';
  };
  
  // Render star rating component
  const StarRating = ({ rating, onRatingChange, editable = false }) => {
    return (
      <div className="star-rating">
        {[1, 2, 3, 4, 5].map(star => (
          <span
            key={star}
            className={`star ${star <= rating ? 'star-filled' : ''}`}
            onClick={() => editable && onRatingChange && onRatingChange(star)}
          >
            ★
          </span>
        ))}
      </div>
    );
  };
  
  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Mess Menu & Feedback</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => openFeedbackForm()}
            className="btn btn-primary flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Give Feedback
          </button>
          
          {(user?.role === 'admin' || user?.role === 'staff') && (
            <button
              onClick={openCreateMenuForm}
              className="btn btn-secondary flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Add Menu Item
            </button>
          )}
        </div>
      </div>
      
      {(success || error) && (
        <div className={`mb-4 p-4 rounded-md ${success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message || error}
        </div>
      )}
      
      {/* Menu Section */}
      <div className="card mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="card-title">Mess Menu</h2>
          <div className="flex flex-wrap gap-2">
            <select
              name="day_of_week"
              value={menuFilters.day_of_week}
              onChange={handleMenuFilterChange}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm"
            >
              <option value="">All Days</option>
              {daysOfWeek.map(day => (
                <option key={day} value={day}>{day}</option>
              ))}
            </select>
            
            <select
              name="meal_type"
              value={menuFilters.meal_type}
              onChange={handleMenuFilterChange}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm"
            >
              <option value="">All Meals</option>
              {mealTypes.map(type => (
                <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
              ))}
            </select>
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        ) : menuItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {menuItems.map(menuItem => (
              <div key={menuItem.id} className="border rounded-lg p-4 bg-white hover:shadow-md transition duration-200">
                <div className="flex justify-between">
                  <div>
                    <h3 className="font-medium text-lg capitalize">{menuItem.meal_type}</h3>
                    <p className="text-gray-500">{menuItem.day_of_week}</p>
                  </div>
                  
                  {(user?.role === 'admin' || user?.role === 'staff') && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openEditMenuForm(menuItem)}
                        className="p-1 text-blue-600 hover:text-blue-800"
                        title="Edit"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteMenuItem(menuItem.id)}
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
                
                <p className="mt-2 whitespace-pre-line">{menuItem.description}</p>
                
                <div className="mt-3">
                  <button
                    onClick={() => openFeedbackForm(menuItem.meal_type)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Give feedback
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No menu items found for the selected filters.</p>
          </div>
        )}
      </div>
      
      {/* Feedback Stats - Only visible to admin and staff */}
      {(user?.role === 'admin' || user?.role === 'staff') && feedbackStats && (
        <div className="card mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="card-title">Feedback Statistics</h2>
            <div className="flex flex-wrap gap-2">
              <select
                name="meal_type"
                value={statsFilters.meal_type}
                onChange={handleStatsFilterChange}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm"
              >
                <option value="">All Meals</option>
                {mealTypes.map(type => (
                  <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                ))}
              </select>
              
              <select
                name="days"
                value={statsFilters.days}
                onChange={handleStatsFilterChange}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm"
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 3 months</option>
                <option value="365">Last year</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="font-medium text-gray-700 mb-2">Average Rating</h3>
              <div className="flex items-center">
                <div className="text-3xl font-bold text-blue-600">
                  {feedbackStats.average_rating.toFixed(1)}
                </div>
                <div className="ml-2">
                  <StarRating rating={Math.round(feedbackStats.average_rating)} />
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Based on {feedbackStats.total_feedback} feedback submissions
              </p>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="font-medium text-gray-700 mb-2">Rating Distribution</h3>
              {[5, 4, 3, 2, 1].map(rating => (
                <div key={rating} className="flex items-center mb-1">
                  <span className="w-3">{rating}</span>
                  <span className="mx-2">★</span>
                  <div className="flex-1 h-4 bg-gray-200 rounded-full">
                    <div 
                      className="h-4 bg-blue-600 rounded-full"
                      style={{ 
                        width: `${(feedbackStats.rating_distribution[rating] / feedbackStats.total_feedback) * 100}%` 
                      }}
                    ></div>
                  </div>
                  <span className="ml-2 text-xs">{feedbackStats.rating_distribution[rating]}</span>
                </div>
              ))}
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="font-medium text-gray-700 mb-2">Sentiment Analysis</h3>
              <div className="flex items-center mt-4">
                <div className={`text-lg font-bold ${getSentimentClass(feedbackStats.average_sentiment)}`}>
                  {feedbackStats.average_sentiment > 0.2 ? 'Positive' : 
                   feedbackStats.average_sentiment < -0.2 ? 'Negative' : 'Neutral'}
                </div>
                <span className="ml-2 text-gray-500">
                  ({feedbackStats.average_sentiment.toFixed(2)})
                </span>
              </div>
              <div className="mt-4 h-4 bg-gray-200 rounded-full">
                <div 
                  className={`h-4 rounded-full ${
                    feedbackStats.average_sentiment > 0.2 ? 'bg-green-500' : 
                    feedbackStats.average_sentiment < -0.2 ? 'bg-red-500' : 
                    'bg-yellow-500'
                  }`}
                  style={{ 
                    width: `${((feedbackStats.average_sentiment + 1) / 2) * 100}%` 
                  }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Negative</span>
                <span>Neutral</span>
                <span>Positive</span>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Recent Feedback Section */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h2 className="card-title">Recent Feedback</h2>
          <select
            name="meal_type"
            value={feedbackFilters.meal_type}
            onChange={handleFeedbackFilterChange}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm"
          >
            <option value="">All Meals</option>
            {mealTypes.map(type => (
              <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
            ))}
          </select>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        ) : feedback.length > 0 ? (
          <div className="space-y-4">
            {feedback.map(item => (
              <div key={item.id} className="border-b pb-4 last:border-b-0">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center">
                      <h3 className="font-medium capitalize">{item.meal_type}</h3>
                      <span className="mx-2">•</span>
                      <StarRating rating={item.rating} />
                    </div>
                    <p className="text-sm text-gray-500">
                      By {item.user.full_name} • {formatDate(item.created_at)}
                    </p>
                  </div>
                  
                  {item.sentiment_score !== null && (user?.role === 'admin' || user?.role === 'staff') && (
                    <span className={`text-sm ${getSentimentClass(item.sentiment_score)}`}>
                      Sentiment: {item.sentiment_score.toFixed(2)}
                    </span>
                  )}
                </div>
                
                {item.comment && (
                  <p className="mt-2 text-gray-700">{item.comment}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No feedback found. Be the first to give feedback!</p>
          </div>
        )}
        
        {/* Pagination */}
        <div className="flex justify-between items-center mt-4">
          <button
            onClick={() => setFeedbackFilters(prev => ({ ...prev, skip: Math.max(0, prev.skip - prev.limit) }))}
            disabled={feedbackFilters.skip === 0}
            className={`btn btn-secondary ${feedbackFilters.skip === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Previous
          </button>
          <span className="text-gray-600">
            Showing {feedbackFilters.skip + 1} - {Math.min(feedbackFilters.skip + feedbackFilters.limit, feedbackFilters.skip + feedback.length)} feedback
          </span>
          <button
            onClick={() => setFeedbackFilters(prev => ({ ...prev, skip: prev.skip + prev.limit }))}
            disabled={feedback.length < feedbackFilters.limit}
            className={`btn btn-secondary ${feedback.length < feedbackFilters.limit ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Next
          </button>
        </div>
      </div>
      
      {/* Menu Form Modal */}
      {isMenuFormOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                {editingMenuItem ? 'Edit Menu Item' : 'Add New Menu Item'}
              </h2>
              <button onClick={closeMenuForm} className="text-gray-500 hover:text-gray-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleMenuSubmit}>
              <div className="space-y-4">
                <div className="form-group">
                  <label htmlFor="day_of_week" className="label">Day of Week*</label>
                  <select
                    id="day_of_week"
                    name="day_of_week"
                    value={menuFormData.day_of_week}
                    onChange={handleMenuFormChange}
                    required
                    className="input"
                  >
                    <option value="">Select Day</option>
                    {daysOfWeek.map(day => (
                      <option key={day} value={day}>{day}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="meal_type" className="label">Meal Type*</label>
                  <select
                    id="meal_type"
                    name="meal_type"
                    value={menuFormData.meal_type}
                    onChange={handleMenuFormChange}
                    required
                    className="input"
                  >
                    <option value="">Select Meal Type</option>
                    {mealTypes.map(type => (
                      <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="description" className="label">Description*</label>
                  <textarea
                    id="description"
                    name="description"
                    value={menuFormData.description}
                    onChange={handleMenuFormChange}
                    required
                    rows="5"
                    className="input"
                    placeholder="Enter the menu items..."
                  ></textarea>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button type="button" onClick={closeMenuForm} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingMenuItem ? 'Update Menu Item' : 'Create Menu Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Feedback Form Modal */}
      {isFeedbackFormOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Submit Feedback</h2>
              <button onClick={closeFeedbackForm} className="text-gray-500 hover:text-gray-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleFeedbackSubmit}>
              <div className="space-y-4">
                <div className="form-group">
                  <label htmlFor="meal_type" className="label">Meal Type*</label>
                  <select
                    id="meal_type"
                    name="meal_type"
                    value={feedbackFormData.meal_type}
                    onChange={handleFeedbackFormChange}
                    required
                    className="input"
                  >
                    <option value="">Select Meal Type</option>
                    {mealTypes.map(type => (
                      <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="label">Rating*</label>
                  <div className="mt-1">
                    <StarRating rating={feedbackFormData.rating} onRatingChange={handleStarClick} editable={true} />
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="comment" className="label">Comment</label>
                  <textarea
                    id="comment"
                    name="comment"
                    value={feedbackFormData.comment}
                    onChange={handleFeedbackFormChange}
                    rows="4"
                    className="input"
                    placeholder="Share your thoughts about the food..."
                  ></textarea>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button type="button" onClick={closeFeedbackForm} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Submit Feedback
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessFeedback;
