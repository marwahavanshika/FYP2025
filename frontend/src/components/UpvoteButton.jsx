import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import axios from 'axios';

const UpvoteButton = ({ complaintId, upvoteCount, hasUpvoted, onUpvoteChange }) => {
  const token = useSelector(state => state.auth.token);
  const [isUpdating, setIsUpdating] = useState(false);
  
  const handleUpvote = async () => {
    if (isUpdating) return;
    
    setIsUpdating(true);
    try {
      const response = await axios.post(
        `/api/complaints/${complaintId}/upvote`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      if (response.data) {
        onUpvoteChange({
          id: complaintId,
          upvote_count: response.data.upvote_count,
          has_upvoted: response.data.has_upvoted
        });
      } else {
        console.error('Invalid response format:', response);
      }
    } catch (error) {
      console.error('Error toggling upvote:', error);
      alert('Failed to update upvote. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const displayCount = typeof upvoteCount === 'number' ? upvoteCount : 0;
  const isUpvoted = hasUpvoted === true;

  return (
    <motion.button
      onClick={handleUpvote}
      disabled={isUpdating}
      className={`flex items-center space-x-1 px-2 py-1 rounded-full border ${
        isUpvoted 
          ? 'bg-blue-100 border-blue-300 text-blue-600' 
          : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
      }`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <motion.span
        animate={isUpvoted ? { scale: [1, 1.2, 1] } : {}}
        transition={{ duration: 0.2 }}
      >
        👍
      </motion.span>
      <span className="font-medium">{displayCount}</span>
    </motion.button>
  );
};

export default UpvoteButton;