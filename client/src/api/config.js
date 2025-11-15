import axios from 'axios';

// HTTPS API configuration for local development with self-signed certificate
export const API_BASE_URL = 'https://localhost:4430/api';

// Configure axios to accept self-signed certificates in development
if (process.env.NODE_ENV === 'development') {
  axios.defaults.httpsAgent = { rejectUnauthorized: false };
}

// Create a pre-configured axios instance
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  httpsAgent: process.env.NODE_ENV === 'development' ? { rejectUnauthorized: false } : undefined,
});

export default apiClient;
