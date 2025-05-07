// API URL - for production, use the server URL; for development, this will use the Vite proxy
export const API_URL = '';

// Maximum items to show in lists before "View all" link appears
export const MAX_LIST_ITEMS = 5;

// Dashboard card colors
export const CARD_COLORS = {
  DEFAULT: {
    bg: 'bg-white',
    text: 'text-gray-800'
  },
  SUCCESS: {
    bg: 'bg-green-100',
    text: 'text-green-800'
  },
  WARNING: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-800'
  },
  DANGER: {
    bg: 'bg-red-100',
    text: 'text-red-800'
  },
  INFO: {
    bg: 'bg-blue-100',
    text: 'text-blue-800'
  }
};

// Complaint status colors
export const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800',
  in_progress: 'bg-blue-100 text-blue-800',
  resolved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800'
};

// Priority colors
export const PRIORITY_COLORS = {
  high: 'bg-red-100 text-red-800',
  medium: 'bg-yellow-100 text-yellow-800',
  low: 'bg-green-100 text-green-800'
};

// Sentiment score thresholds
export const SENTIMENT_THRESHOLDS = {
  POSITIVE: 0.3,
  NEGATIVE: -0.3
};

// User roles
export const USER_ROLES = {
  ADMIN: 'admin',
  HMC: 'hmc',
  WARDEN_LOHIT_GIRLS: 'warden_lohit_girls',
  WARDEN_LOHIT_BOYS: 'warden_lohit_boys',
  WARDEN_PAPUM_BOYS: 'warden_papum_boys',
  WARDEN_SUBHANSHIRI_BOYS: 'warden_subhanshiri_boys',
  PLUMBER: 'plumber',
  ELECTRICIAN: 'electrician',
  MESS_VENDOR: 'mess_vendor',
  STUDENT: 'student'
};

// Hostel names
export const HOSTELS = {
  LOHIT_GIRLS: 'lohit_girls',
  LOHIT_BOYS: 'lohit_boys',
  PAPUM_BOYS: 'papum_boys',
  SUBHANSHIRI_BOYS: 'subhanshiri_boys'
};

// Complaint categories
export const COMPLAINT_CATEGORIES = [
  'plumbing',
  'electrical',
  'furniture',
  'mess',
  'cleanliness',
  'other'
];

// Meal types
export const MEAL_TYPES = [
  'breakfast',
  'lunch',
  'dinner',
  'snacks'
];

// Days of the week
export const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
]; 