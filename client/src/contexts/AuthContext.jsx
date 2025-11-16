import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { LocalStorage, SessionStorage } from '../utils/storageManager.js';
import { API_BASE_URL } from '../api/config.js';

// 1. Create the Context
export const AuthContext = createContext();

// Use the configured API base URL (handles HTTPS/HTTP automatically)
const API_URL = `${API_BASE_URL}/auth`;

// Note: httpsAgent doesn't work in browsers (only Node.js)
// Browser will show certificate warning - user must accept it for HTTPS

// 2. Auth Provider Component
export const AuthProvider = ({ children }) => {
    // State to hold user info and token
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(LocalStorage.getToken());
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
            // 🔥 STORE user profile in localStorage when loaded from API
            LocalStorage.setUserProfile(data);
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
            LocalStorage.setToken(data.token);

            // Store user profile in localStorage for persistence across page refreshes
            if (data.user) {
                LocalStorage.setUserProfile(data.user);
                setUser(data.user);
            }

            // 🔥 STORE refresh token in sessionStorage (security best practice)
            if (data.refreshToken) {
                SessionStorage.setRefreshToken(data.refreshToken);
            } else {
                // 🔥 If no refreshToken from API, generate one (for demo)
                const generatedToken = 'refresh_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
                SessionStorage.setRefreshToken(generatedToken);
            }

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
        LocalStorage.removeToken();
        LocalStorage.removeUserProfile();
        
        // 🔥 COMPLETELY WIPE ALL SESSION STORAGE ON LOGOUT
        // No data from previous session should remain
        sessionStorage.clear();
        
        delete axios.defaults.headers.common['Authorization'];
        console.log('🔓 Logout complete - Entire sessionStorage wiped clean');
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