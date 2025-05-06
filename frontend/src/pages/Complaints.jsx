import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchComplaints, 
  createComplaint, 
  updateComplaint, 
  deleteComplaint, 
  getSuggestions,
  createVoiceComplaint,
  clearComplaintSuccess, 
  clearComplaintError 
} from '../store/complaintsSlice';

const Complaints = () => {
  const dispatch = useDispatch();
  const { complaints, loading, error, success, message, suggestions } = useSelector(state => state.complaints);
  const { user } = useSelector(state => state.auth);
  
  // States for filtering and pagination
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    priority: '',
    skip: 0,
    limit: 10
  });
  
  // States for complaint form
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingComplaint, setEditingComplaint] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    location: '',
    priority: 'medium'
  });
  
  // States for voice complaint
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  
  // Details view
  const [viewingComplaint, setViewingComplaint] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  // Category options
  const categoryOptions = ['plumbing', 'electrical', 'cleaning', 'maintenance', 'noise', 'other'];
  
  // Priority options
  const priorityOptions = ['low', 'medium', 'high', 'urgent'];
  
  // Status options
  const statusOptions = ['pending', 'in_progress', 'resolved', 'rejected'];
  
  // Fetch complaints on component mount and when filters change
  useEffect(() => {
    dispatch(fetchComplaints(filters));
  }, [dispatch, filters]);
  
  // Clear success and error messages after 5 seconds
  useEffect(() => {
    let timer;
    if (success || error) {
      timer = setTimeout(() => {
        dispatch(clearComplaintSuccess());
        dispatch(clearComplaintError());
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
  
  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Open form for creating a new complaint
  const openCreateForm = () => {
    setFormData({
      title: '',
      description: '',
      category: '',
      location: '',
      priority: 'medium'
    });
    setEditingComplaint(null);
    setIsFormOpen(true);
  };
  
  // Open form for editing an existing complaint
  const openEditForm = (complaint) => {
    setFormData({
      title: complaint.title,
      description: complaint.description,
      category: complaint.category,
      location: complaint.location,
      priority: complaint.priority,
      status: complaint.status
    });
    setEditingComplaint(complaint);
    setIsFormOpen(true);
  };
  
  // Close the form
  const closeForm = () => {
    setIsFormOpen(false);
    setAudioBlob(null);
  };
  
  // Submit the form
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (editingComplaint) {
      // Update existing complaint
      dispatch(updateComplaint({
        id: editingComplaint.id,
        complaintData: formData
      }));
    } else {
      // Create new complaint
      dispatch(createComplaint(formData));
    }
    
    closeForm();
  };
  
  // Delete a complaint
  const handleDelete = (complaintId) => {
    if (window.confirm('Are you sure you want to delete this complaint?')) {
      dispatch(deleteComplaint(complaintId));
    }
  };
  
  // View complaint details
  const viewComplaintDetails = (complaint) => {
    setViewingComplaint(complaint);
    setShowSuggestions(false);
  };
  
  // Close complaint details
  const closeComplaintDetails = () => {
    setViewingComplaint(null);
  };
  
  // Get suggestions for a complaint
  const handleGetSuggestions = (complaintId) => {
    dispatch(getSuggestions(complaintId));
    setShowSuggestions(true);
  };
  
  // Start voice recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setAudioBlob(audioBlob);
      };
      
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Error accessing microphone:', err);
      alert('Could not access microphone. Please check your device settings.');
    }
  };
  
  // Stop voice recording
  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      // Stop all audio tracks in the stream
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };
  
  // Submit voice complaint
  const submitVoiceComplaint = async () => {
    if (!audioBlob) return;
    
    try {
      // Convert blob to base64
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = function() {
        const base64Audio = reader.result.split(',')[1]; // Remove the prefix
        dispatch(createVoiceComplaint(base64Audio));
        closeForm();
      };
    } catch (err) {
      console.error('Error converting audio:', err);
      alert('Failed to process audio recording.');
    }
  };
  
  // Format date to readable format
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Get priority color class
  const getPriorityClass = (priority) => {
    switch (priority.toLowerCase()) {
      case 'high':
      case 'urgent':
        return 'priority-high';
      case 'medium':
        return 'priority-medium';
      default:
        return 'priority-low';
    }
  };
  
  // Get status badge class
  const getStatusBadgeClass = (status) => {
    switch (status.toLowerCase()) {
      case 'resolved':
        return 'badge-success';
      case 'in_progress':
        return 'badge-warning';
      case 'pending':
        return 'badge-info';
      case 'rejected':
        return 'badge-danger';
      default:
        return 'badge-secondary';
    }
  };

  // Get sentiment color class
  const getSentimentClass = (score) => {
    if (score === null || score === undefined) return 'sentiment-neutral';
    if (score > 0.2) return 'sentiment-positive';
    if (score < -0.2) return 'sentiment-negative';
    return 'sentiment-neutral';
  };
  
  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Complaints Management</h1>
        <div className="flex space-x-2">
          <button
            onClick={openCreateForm}
            className="btn btn-primary flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            File Complaint
          </button>
        </div>
      </div>
      
      {(success || error) && (
        <div className={`mb-4 p-4 rounded-md ${success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message || error}
        </div>
      )}
      
      {/* Filters */}
      <div className="card mb-6">
        <h2 className="card-title">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="form-group">
            <label htmlFor="status" className="label">Status</label>
            <select
              id="status"
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="input"
            >
              <option value="">All Statuses</option>
              {statusOptions.map(status => (
                <option key={status} value={status}>
                  {status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1)}
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="category" className="label">Category</label>
            <select
              id="category"
              name="category"
              value={filters.category}
              onChange={handleFilterChange}
              className="input"
            >
              <option value="">All Categories</option>
              {categoryOptions.map(category => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="priority" className="label">Priority</label>
            <select
              id="priority"
              name="priority"
              value={filters.priority}
              onChange={handleFilterChange}
              className="input"
            >
              <option value="">All Priorities</option>
              {priorityOptions.map(priority => (
                <option key={priority} value={priority}>
                  {priority.charAt(0).toUpperCase() + priority.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      {/* Complaints Table */}
      <div className="card">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          ) : complaints.length > 0 ? (
            <table className="table">
              <thead className="table-header">
                <tr>
                  <th className="table-header-cell">Title</th>
                  <th className="table-header-cell">Category</th>
                  <th className="table-header-cell">Location</th>
                  <th className="table-header-cell">Status</th>
                  <th className="table-header-cell">Priority</th>
                  <th className="table-header-cell">Created</th>
                  <th className="table-header-cell">Actions</th>
                </tr>
              </thead>
              <tbody className="table-body">
                {complaints.map(complaint => (
                  <tr key={complaint.id} className="table-row">
                    <td className="table-cell font-medium text-gray-900">{complaint.title}</td>
                    <td className="table-cell capitalize">{complaint.category}</td>
                    <td className="table-cell">{complaint.location}</td>
                    <td className="table-cell">
                      <span className={`badge ${getStatusBadgeClass(complaint.status)} capitalize`}>
                        {complaint.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="table-cell">
                      <span className={`font-medium ${getPriorityClass(complaint.priority)} capitalize`}>
                        {complaint.priority}
                      </span>
                    </td>
                    <td className="table-cell">{formatDate(complaint.created_at)}</td>
                    <td className="table-cell">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => viewComplaintDetails(complaint)}
                          className="p-1 text-blue-600 hover:text-blue-800"
                          title="View Details"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                          </svg>
                        </button>
                        {(user?.id === complaint.user_id || user?.role === 'admin' || user?.role === 'staff') && (
                          <>
                            <button
                              onClick={() => openEditForm(complaint)}
                              className="p-1 text-blue-600 hover:text-blue-800"
                              title="Edit"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDelete(complaint.id)}
                              className="p-1 text-red-600 hover:text-red-800"
                              title="Delete"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No complaints found. Please adjust your filters or file a new complaint.</p>
            </div>
          )}
        </div>
        
        {/* Pagination */}
        <div className="flex justify-between items-center mt-4">
          <button
            onClick={() => setFilters(prev => ({ ...prev, skip: Math.max(0, prev.skip - prev.limit) }))}
            disabled={filters.skip === 0}
            className={`btn btn-secondary ${filters.skip === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Previous
          </button>
          <span className="text-gray-600">
            Showing {filters.skip + 1} - {Math.min(filters.skip + filters.limit, filters.skip + complaints.length)} complaints
          </span>
          <button
            onClick={() => setFilters(prev => ({ ...prev, skip: prev.skip + prev.limit }))}
            disabled={complaints.length < filters.limit}
            className={`btn btn-secondary ${complaints.length < filters.limit ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Next
          </button>
        </div>
      </div>
      
      {/* Complaint Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                {editingComplaint ? 'Edit Complaint' : 'File a New Complaint'}
              </h2>
              <button onClick={closeForm} className="text-gray-500 hover:text-gray-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="mb-4">
              <h3 className="font-medium mb-2">Choose how to file your complaint:</h3>
              <div className="flex space-x-4 mb-4">
                <button
                  type="button"
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`flex items-center px-4 py-2 rounded-md ${isRecording ? 'bg-red-600 text-white' : 'bg-blue-100 text-blue-800'}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                  </svg>
                  {isRecording ? 'Stop Recording' : 'Record Voice'}
                </button>
                
                {audioBlob && (
                  <audio
                    controls
                    src={URL.createObjectURL(audioBlob)}
                    className="w-full"
                  />
                )}
              </div>
              
              {audioBlob && (
                <div className="flex justify-end mb-4">
                  <button
                    type="button"
                    onClick={submitVoiceComplaint}
                    className="btn btn-primary"
                  >
                    Submit Voice Complaint
                  </button>
                </div>
              )}
              
              <div className="text-center my-4">
                <span className="px-4 text-gray-500">OR</span>
              </div>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label htmlFor="title" className="label">Title*</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="input"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="location" className="label">Location*</label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    required
                    className="input"
                    placeholder="Building/Room/Area"
                  />
                </div>
                
                <div className="form-group md:col-span-2">
                  <label htmlFor="description" className="label">Description*</label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows="4"
                    className="input"
                    placeholder="Please describe the issue in detail"
                  ></textarea>
                </div>
                
                <div className="form-group">
                  <label htmlFor="category" className="label">Category*</label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    className="input"
                  >
                    <option value="">Select Category</option>
                    <option value="auto">Auto-detect from description</option>
                    {categoryOptions.map(category => (
                      <option key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="priority" className="label">Priority</label>
                  <select
                    id="priority"
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    className="input"
                  >
                    <option value="auto">Auto-detect from description</option>
                    {priorityOptions.map(priority => (
                      <option key={priority} value={priority}>
                        {priority.charAt(0).toUpperCase() + priority.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                
                {editingComplaint && (user?.role === 'admin' || user?.role === 'staff') && (
                  <div className="form-group">
                    <label htmlFor="status" className="label">Status</label>
                    <select
                      id="status"
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="input"
                    >
                      {statusOptions.map(status => (
                        <option key={status} value={status}>
                          {status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button type="button" onClick={closeForm} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingComplaint ? 'Update Complaint' : 'Submit Complaint'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Complaint Details Modal */}
      {viewingComplaint && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-3xl w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Complaint Details</h2>
              <button onClick={closeComplaintDetails} className="text-gray-500 hover:text-gray-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-500">Title</p>
                <p className="font-medium">{viewingComplaint.title}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <span className={`badge ${getStatusBadgeClass(viewingComplaint.status)} capitalize`}>
                  {viewingComplaint.status.replace('_', ' ')}
                </span>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Category</p>
                <p className="capitalize">{viewingComplaint.category}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Priority</p>
                <p className={`font-medium ${getPriorityClass(viewingComplaint.priority)} capitalize`}>
                  {viewingComplaint.priority}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Location</p>
                <p>{viewingComplaint.location}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Created At</p>
                <p>{formatDate(viewingComplaint.created_at)}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Reported By</p>
                <p>{viewingComplaint.user.full_name}</p>
              </div>
              
              {viewingComplaint.resolved_at && (
                <div>
                  <p className="text-sm text-gray-500">Resolved At</p>
                  <p>{formatDate(viewingComplaint.resolved_at)}</p>
                </div>
              )}
              
              <div className="md:col-span-2">
                <p className="text-sm text-gray-500">Description</p>
                <p className="whitespace-pre-line">{viewingComplaint.description}</p>
              </div>
              
              {viewingComplaint.sentiment_score !== null && (
                <div>
                  <p className="text-sm text-gray-500">Sentiment Analysis</p>
                  <p className={getSentimentClass(viewingComplaint.sentiment_score)}>
                    {viewingComplaint.sentiment_score > 0.2 ? 'Positive' : 
                     viewingComplaint.sentiment_score < -0.2 ? 'Negative' : 'Neutral'} 
                    ({viewingComplaint.sentiment_score.toFixed(2)})
                  </p>
                </div>
              )}
            </div>
            
            <div className="mt-4">
              <button
                onClick={() => handleGetSuggestions(viewingComplaint.id)}
                className="btn btn-secondary"
              >
                Get AI Suggestions
              </button>
              
              {showSuggestions && (
                <div className="mt-4 p-4 bg-blue-50 rounded-md">
                  <h3 className="font-medium text-blue-800 mb-2">AI Suggestions</h3>
                  {loading ? (
                    <p>Loading suggestions...</p>
                  ) : suggestions.length > 0 ? (
                    <ul className="list-disc pl-5 space-y-1">
                      {suggestions.map((suggestion, index) => (
                        <li key={index}>{suggestion}</li>
                      ))}
                    </ul>
                  ) : (
                    <p>No suggestions available.</p>
                  )}
                </div>
              )}
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button onClick={closeComplaintDetails} className="btn btn-secondary">
                Close
              </button>
              
              {(user?.id === viewingComplaint.user_id || user?.role === 'admin' || user?.role === 'staff') && (
                <button
                  onClick={() => {
                    closeComplaintDetails();
                    openEditForm(viewingComplaint);
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

export default Complaints;
