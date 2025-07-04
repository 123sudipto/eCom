import axios from 'axios';
import toast from 'react-hot-toast';

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000 // 10 seconds timeout
});

// Request interceptor for adding auth token
instance.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    } catch (error) {
      console.error('Request interceptor error:', error);
      return Promise.reject(error);
    }
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);

    // Network error
    if (!error.response) {
      toast.error('Network error. Please check your connection and try again.');
      return Promise.reject(new Error('Network error'));
    }

    // Timeout error
    if (error.code === 'ECONNABORTED') {
      toast.error('Request timed out. Please try again.');
      return Promise.reject(new Error('Request timeout'));
    }

    // Server errors
    switch (error.response.status) {
      case 400:
        if (error.response.data.errors) {
          // Handle validation errors
          Object.values(error.response.data.errors).forEach(err => {
            toast.error(err);
          });
        } else {
          toast.error(error.response.data.message || 'Invalid request');
        }
        break;
      case 401:
        toast.error(error.response.data.message || 'Session expired. Please login again.');
        localStorage.removeItem('token');
        if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
          window.location.href = '/login';
        }
        break;
      case 403:
        toast.error(error.response.data.message || 'Access denied');
        break;
      case 404:
        toast.error(error.response.data.message || 'Resource not found');
        break;
      case 409:
        toast.error(error.response.data.message || 'Conflict - Resource already exists');
        break;
      case 422:
        const validationErrors = error.response.data.errors;
        if (validationErrors) {
          Object.values(validationErrors).forEach(err => {
            toast.error(err);
          });
        } else {
          toast.error(error.response.data.message || 'Validation error');
        }
        break;
      case 500:
        toast.error('Server error. Please try again later.');
        break;
      default:
        toast.error('Something went wrong. Please try again.');
    }

    return Promise.reject(error);
  }
);

export default instance; 