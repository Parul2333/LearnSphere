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

export const notifyNewContent = (io, subjectId, contentData) => {
    io.to(`subject_${subjectId}`).emit('new_content', {
        message: `New ${contentData.category} added: ${contentData.title}`,
        content: contentData,
        timestamp: new Date(),
    });
};

export const notifyNewSubject = (io, branchId, subjectData) => {
    io.to(`branch_${branchId}`).emit('new_subject', {
        message: `New subject created: ${subjectData.name}`,
        subject: subjectData,
        timestamp: new Date(),
    });
};

export const notifyProgressUpdate = (io, subjectId, percentage) => {
    io.to(`subject_${subjectId}`).emit('progress_update', {
        message: `Subject completion updated to ${percentage}%`,
        percentage,
        timestamp: new Date(),
    });
};

export const notifyAdminBroadcast = (io, adminId, message, data = {}) => {
    io.to(`admin_${adminId}`).emit('admin_message', {
        message,
        data,
        timestamp: new Date(),
    });
};
