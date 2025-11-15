import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

// 1. Create the Context
export const AuthContext = createContext();

// Define the API base URL (HTTPS on port 4430 for local dev with self-signed cert)
const API_URL = 'https://localhost:4430/api/auth';

// Configure axios to accept self-signed certificates in development
if (process.env.NODE_ENV === 'development') {
  axios.defaults.httpsAgent = { rejectUnauthorized: false };
}

// 2. Auth Provider Component
export const AuthProvider = ({ children }) => {
    // State to hold user info and token
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    // Set up Axios interceptor to automatically add the token to every request
    useEffect(() => {
        if (token) {
            // Set the token for subsequent requests
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            
            // If token exists, try to fetch user details (for page refresh)
            loadUser();
        } else {
            // Clear authorization header if no token is present
            delete axios.defaults.headers.common['Authorization'];
            setLoading(false);
        }
    }, [token]);

    // Function to fetch user details from the /me endpoint
    const loadUser = async () => {
        try {
            const { data } = await axios.get(`${API_URL}/me`);
            setUser(data);
        } catch (error) {
            // If the token is invalid or expired, quietly clear it without noisy logs
            const status = error?.response?.status;
            if (status === 401 || status === 403) {
                // clear token silently
                logout();
            } else {
                // For other errors (network/db), log for debugging but don't repeatedly call logout
                console.warn('Failed to load user on refresh:', error?.message || error);
            }
        } finally {
            setLoading(false);
        }
    };

    // 💡 MODIFIED Login function: Now accepts the rememberMe flag
    const login = async (email, password, rememberMe = false) => {
        setLoading(true);
        try {
            // CRITICAL FIX: Send rememberMe flag to the backend
            const { data } = await axios.post(`${API_URL}/login`, { email, password, rememberMe });
            
            // Set token in state and local storage (persists the 90-day token)
            setToken(data.token);
            localStorage.setItem('token', data.token);

            // Set user data 
            setUser(data);
            setLoading(false);
            return data;
        } catch (error) {
            setLoading(false);
            throw error; // Propagate error for UI handling
        }
    };

    // Logout function
    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
    };
    
    // Check if user is an admin
    const isAdmin = user && user.role === 'admin';

    const value = {
        user,
        token,
        loading,
        isAdmin,
        login, // Updated login function
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// 3. Custom Hook for easy access
export const useAuth = () => useContext(AuthContext);