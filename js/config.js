/**
 * config.js – Centralized API configuration
 * Change API_BASE_URL based on environment (development/production)
 */

// Auto-detect environment
const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

// Set API URL based on environment
const API_BASE_URL = isDevelopment 
  ? 'http://localhost:5000'           // Local development
  : 'https://your-render-backend-url.onrender.com';  // Production (Update this!)

console.log('🌐 API Environment:', isDevelopment ? 'Development' : 'Production');
console.log('📍 API Base URL:', API_BASE_URL);
