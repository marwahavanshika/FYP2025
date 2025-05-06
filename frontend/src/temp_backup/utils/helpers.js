/**
 * Format a date to a readable string
 * @param {string|Date} dateString - The date to format
 * @param {object} options - Options for date formatting
 * @returns {string} Formatted date string
 */
export const formatDate = (dateString, options = {}) => {
  if (!dateString) return 'N/A';
  
  const defaultOptions = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  
  const mergedOptions = { ...defaultOptions, ...options };
  
  return new Date(dateString).toLocaleDateString(undefined, mergedOptions);
};

/**
 * Get a color class for priority based on its value
 * @param {string} priority - The priority value
 * @returns {string} CSS class for the given priority
 */
export const getPriorityClass = (priority) => {
  switch (priority?.toLowerCase()) {
    case 'high':
    case 'urgent':
      return 'priority-high';
    case 'medium':
      return 'priority-medium';
    default:
      return 'priority-low';
  }
};

/**
 * Get a badge class for status based on its value
 * @param {string} status - The status value
 * @returns {string} CSS class for the given status
 */
export const getStatusBadgeClass = (status) => {
  switch (status?.toLowerCase()) {
    case 'resolved':
      return 'badge-success';
    case 'in_progress':
    case 'in progress':
      return 'badge-warning';
    case 'pending':
      return 'badge-info';
    case 'rejected':
      return 'badge-danger';
    default:
      return 'badge-secondary';
  }
};

/**
 * Get a color class for sentiment score
 * @param {number} score - The sentiment score
 * @returns {string} CSS class for the given sentiment score
 */
export const getSentimentClass = (score) => {
  if (score === null || score === undefined) return 'sentiment-neutral';
  if (score > 0.2) return 'sentiment-positive';
  if (score < -0.2) return 'sentiment-negative';
  return 'sentiment-neutral';
};

/**
 * Truncate text to a specified length and add ellipsis if needed
 * @param {string} text - The text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * Validate email format
 * @param {string} email - The email to validate
 * @returns {boolean} Whether the email is valid
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Get current day of week
 * @returns {string} Current day of week
 */
export const getCurrentDay = () => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[new Date().getDay()];
};

/**
 * Convert base64 to blob
 * @param {string} base64 - Base64 encoded string
 * @param {string} contentType - Content type
 * @returns {Blob} Blob object
 */
export const base64toBlob = (base64, contentType = '') => {
  const byteCharacters = atob(base64.split(',')[1]);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += 512) {
    const slice = byteCharacters.slice(offset, offset + 512);
    const byteNumbers = new Array(slice.length);
    
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  return new Blob(byteArrays, { type: contentType });
};
