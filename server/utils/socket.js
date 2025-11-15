// server/utils/socket.js
// Helper module to access Socket.io instance from controllers

let socketIOInstance = null;

/**
 * Set the Socket.io instance (called from server.js)
 */
export const setSocketIO = (io) => {
    socketIOInstance = io;
};

/**
 * Get the Socket.io instance (used in controllers)
 * Returns null if not initialized or not ready
 */
export const getSocketIO = () => {
    if (!socketIOInstance) {
        console.warn('[Socket] Socket.io instance not initialized');
        return null;
    }
    return socketIOInstance;
};

/**
 * Check if Socket.io is ready
 */
export const isSocketReady = () => {
    return socketIOInstance !== null;
};

