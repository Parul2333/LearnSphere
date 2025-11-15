// client/src/contexts/NotificationContext.jsx

import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        // Determine server URL based on current protocol
        // In development, try HTTPS first (4430), fallback to HTTP (5000)
        const isHttps = window.location.protocol === 'https:';
        const serverPort = isHttps ? 4430 : 5000;
        const serverUrl = `${window.location.protocol}//${window.location.hostname}:${serverPort}`;
        
        console.log(`🔌 Connecting to WebSocket server: ${serverUrl}`);
        console.log(`🔒 Protocol: ${window.location.protocol}, Port: ${serverPort}`);
        
        // Initialize Socket.io connection
        const newSocket = io(serverUrl, {
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            reconnectionAttempts: Infinity, // Keep trying to reconnect
            transports: ['websocket', 'polling'], // Try websocket first, fallback to polling
            secure: isHttps,
            rejectUnauthorized: false, // Accept self-signed cert in dev (required for localhost HTTPS)
            timeout: 20000, // 20 second connection timeout
            forceNew: false, // Reuse existing connection if available
        });

        newSocket.on('connect', () => {
            console.log('✅ Connected to WebSocket notification server');
        });

        newSocket.on('disconnect', (reason) => {
            console.log('❌ Disconnected from notification server:', reason);
        });

        newSocket.on('connect_error', (error) => {
            console.error('❌ WebSocket connection error:', error.message);
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

        // Listen for different notification types
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
