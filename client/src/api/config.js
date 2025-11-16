import axios from 'axios';

// Auto-detect protocol: In development, prefer HTTP to avoid certificate issues
// In production, use the same protocol as the frontend
const getApiBaseUrl = () => {
  // Check if we're in browser environment
  if (typeof window !== 'undefined') {
    const isDevelopment = process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost';
    const isHttps = window.location.protocol === 'https:';
    
    // In development, prefer HTTP to avoid certificate issues
    // In production, match the frontend protocol
    const useHttp = isDevelopment || !isHttps;
    const apiPort = useHttp ? 5000 : 4430;
    const apiProtocol = useHttp ? 'http:' : 'https:';
    
    return `${apiProtocol}//${window.location.hostname}:${apiPort}/api`;
  }
  // Fallback for SSR or Node.js environments
  return 'http://localhost:5000/api';
};

export const API_BASE_URL = getApiBaseUrl();

// Note: httpsAgent doesn't work in browsers (only Node.js)
// Browser will show certificate warning - user must accept it
// For development, consider using HTTP for both frontend and backend to avoid certificate issues

// Create a pre-configured axios instance
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  // timeout: 10000, // 10 second timeout
});

// Add request interceptor for debugging
apiClient.interceptors.request.use(
  (config) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[API] ${config.method.toUpperCase()} ${config.url}`);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
      console.error('[API] Network error - check if server is running');
      
      // In development, if HTTPS fails, suggest using HTTP
      if (process.env.NODE_ENV === 'development' && error.config?.url?.includes('https://')) {
        console.warn('[API] HTTPS request failed. Try accessing frontend via HTTP: http://localhost:5173');
      }
    } else if (error.code === 'ERR_CERT_AUTHORITY_INVALID' || error.message.includes('certificate')) {
      console.error('[API] Certificate error - in development, API will use HTTP to avoid certificate issues');
    }
    return Promise.reject(error);
  }
);

export default apiClient;
