// client/src/contexts/NotificationContext.jsx

import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        // Use the same protocol/host as the frontend to avoid mixed-content issues
        const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
        const isDevelopment = process.env.NODE_ENV !== 'production';
        const serverPort = isHttps ? 4430 : 5000;
        const protocol = isHttps ? 'https' : 'http';
        const serverUrl = `${protocol}://${window.location.hostname}:${serverPort}`;

        console.log(`🔌 Connecting to WebSocket server: ${serverUrl}`);

        // Initialize Socket.io connection
        const newSocket = io(serverUrl, {
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            reconnectionAttempts: Infinity, // Keep trying to reconnect
            transports: ['polling', 'websocket'], // Try polling first (more reliable), then websocket
            secure: isHttps,
            // rejectUnauthorized left false only for development when necessary. If your CA is trusted,
            // set to true. We'll set to false only if running in development and the cert is self-signed.
            rejectUnauthorized: process.env.NODE_ENV === 'development' ? false : true,
            timeout: 20000, // 20 second connection timeout
            forceNew: false, // Reuse existing connection if available
            autoConnect: true, // Automatically connect when socket is created
            withCredentials: true, // Send credentials (cookies, auth headers) with requests
        });

        let hasConnected = false;

        newSocket.on('connect', () => {
            hasConnected = true;
            console.log('✅ Connected to WebSocket notification server');
            setSocket(newSocket);
        });

        newSocket.on('disconnect', (reason) => {
            console.log('❌ Disconnected from notification server:', reason);
            if (reason === 'io server disconnect') {
                // Server disconnected, don't try to reconnect
                newSocket.disconnect();
            }
        });

        newSocket.on('connect_error', (error) => {
            console.error('❌ WebSocket connection error:', error.message);
            console.error('❌ Error details:', error);
            // Do not attempt an HTTP fallback from an HTTPS page — this causes mixed-content.
            // In development, inspect the server and certificate instead of falling back to HTTP.
        });

        newSocket.on('reconnect', (attemptNumber) => {
            console.log(`🔄 Reconnected to WebSocket server (attempt ${attemptNumber})`);
        });

        newSocket.on('reconnect_error', (error) => {
            console.error('❌ WebSocket reconnection error:', error.message);
        });

        newSocket.on('reconnect_failed', () => {
            console.error('❌ WebSocket reconnection failed after all attempts');
        });

        newSocket.on('new_content', (data) => {
            addNotification({
                id: Date.now(),
                type: 'new_content',
                message: data.message,
                data: data.content,
                timestamp: data.timestamp,
            });
        });

        newSocket.on('new_subject', (data) => {
            addNotification({
                id: Date.now(),
                type: 'new_subject',
                message: data.message,
                data: data.subject,
                timestamp: data.timestamp,
            });
        });

        newSocket.on('progress_update', (data) => {
            addNotification({
                id: Date.now(),
                type: 'progress_update',
                message: data.message,
                data: { percentage: data.percentage },
                timestamp: data.timestamp,
            });
        });

        newSocket.on('admin_message', (data) => {
            addNotification({
                id: Date.now(),
                type: 'admin_message',
                message: data.message,
                data: data.data,
                timestamp: data.timestamp,
            });
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, []);

    const addNotification = (notification) => {
        setNotifications((prev) => [notification, ...prev]);
        // Auto-remove after 5 seconds
        setTimeout(() => {
            setNotifications((prev) => prev.filter((n) => n.id !== notification.id));
        }, 5000);
    };

    const removeNotification = (id) => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
    };

    const joinSubject = (subjectId) => {
        if (socket) socket.emit('join_subject', subjectId);
    };

    const leaveSubject = (subjectId) => {
        if (socket) socket.emit('leave_subject', subjectId);
    };

    const joinBranch = (branchId) => {
        if (socket) socket.emit('join_branch', branchId);
    };

    const joinAdmin = (adminId) => {
        if (socket) socket.emit('join_admin', adminId);
    };

    const value = {
        notifications,
        addNotification,
        removeNotification,
        joinSubject,
        leaveSubject,
        joinBranch,
        joinAdmin,
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => useContext(NotificationContext);
