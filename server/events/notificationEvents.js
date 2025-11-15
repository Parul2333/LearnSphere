// server/events/notificationEvents.js

/**
 * Real-time notification system using Socket.io
 * Sends notifications to connected clients for:
 * - New content added to a subject
 * - New subjects created in a branch
 * - Admin announcements
 * - System updates
 */

export const setupNotificationEvents = (io) => {
    io.on('connection', (socket) => {
        console.log(`🔗 User connected: ${socket.id}`);

        // Join a room based on subject ID for targeted updates
        socket.on('join_subject', (subjectId) => {
            socket.join(`subject_${subjectId}`);
            console.log(`📍 Socket ${socket.id} joined subject room: ${subjectId}`);
        });

        // Leave a subject room
        socket.on('leave_subject', (subjectId) => {
            socket.leave(`subject_${subjectId}`);
            console.log(`📍 Socket ${socket.id} left subject room: ${subjectId}`);
        });

        // Join branch updates room
        socket.on('join_branch', (branchId) => {
            socket.join(`branch_${branchId}`);
            console.log(`📍 Socket ${socket.id} joined branch room: ${branchId}`);
        });

        // Join admin notifications room
        socket.on('join_admin', (adminId) => {
            socket.join(`admin_${adminId}`);
            console.log(`📍 Admin socket ${socket.id} joined admin room: ${adminId}`);
        });

        // Disconnect handler
        socket.on('disconnect', () => {
            console.log(`🔌 User disconnected: ${socket.id}`);
        });
    });
};

// Notification emission functions (called from controllers)

/**
 * Notify users subscribed to a subject about new content
 */
export const notifyNewContent = (io, subjectId, contentData) => {
    if (!io) {
        console.warn('[Socket] Cannot notify: Socket.io instance not available');
        return;
    }
    
    try {
        const room = `subject_${subjectId}`;
        const notification = {
            message: `New ${contentData.category} added: ${contentData.title}`,
            content: contentData,
            timestamp: new Date().toISOString(),
        };
        
        io.to(room).emit('new_content', notification);
        console.log(`📢 Notified room "${room}" about new content: ${contentData.title}`);
    } catch (error) {
        console.error('[Socket] Error notifying new content:', error);
    }
};

/**
 * Notify users subscribed to a branch about new subject
 */
export const notifyNewSubject = (io, branchId, subjectData) => {
    if (!io) {
        console.warn('[Socket] Cannot notify: Socket.io instance not available');
        return;
    }
    
    try {
        const room = `branch_${branchId}`;
        const notification = {
            message: `New subject created: ${subjectData.name}`,
            subject: subjectData,
            timestamp: new Date().toISOString(),
        };
        
        io.to(room).emit('new_subject', notification);
        console.log(`📢 Notified room "${room}" about new subject: ${subjectData.name}`);
    } catch (error) {
        console.error('[Socket] Error notifying new subject:', error);
    }
};

/**
 * Notify users about subject progress update
 */
export const notifyProgressUpdate = (io, subjectId, percentage) => {
    if (!io) {
        console.warn('[Socket] Cannot notify: Socket.io instance not available');
        return;
    }
    
    try {
        const room = `subject_${subjectId}`;
        const notification = {
            message: `Subject completion updated to ${percentage}%`,
            percentage,
            timestamp: new Date().toISOString(),
        };
        
        io.to(room).emit('progress_update', notification);
        console.log(`📢 Notified room "${room}" about progress update: ${percentage}%`);
    } catch (error) {
        console.error('[Socket] Error notifying progress update:', error);
    }
};

/**
 * Send admin broadcast message
 */
export const notifyAdminBroadcast = (io, adminId, message, data = {}) => {
    if (!io) {
        console.warn('[Socket] Cannot notify: Socket.io instance not available');
        return;
    }
    
    try {
        const room = `admin_${adminId}`;
        const notification = {
            message,
            data,
            timestamp: new Date().toISOString(),
        };
        
        io.to(room).emit('admin_message', notification);
        console.log(`📢 Notified admin room "${room}": ${message}`);
    } catch (error) {
        console.error('[Socket] Error notifying admin:', error);
    }
};
