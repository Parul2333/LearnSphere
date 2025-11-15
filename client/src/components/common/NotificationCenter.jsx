// client/src/components/common/NotificationCenter.jsx

import React from 'react';
import { useNotifications } from '../../contexts/NotificationContext.jsx';

const NotificationCenter = () => {
    const { notifications, removeNotification } = useNotifications();

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'new_content':
                return '📄';
            case 'new_subject':
                return '📚';
            case 'progress_update':
                return '📊';
            case 'admin_message':
                return '📢';
            default:
                return '🔔';
        }
    };

    const getNotificationColor = (type) => {
        switch (type) {
            case 'new_content':
                return 'bg-blue-100 border-blue-400 text-blue-800';
            case 'new_subject':
                return 'bg-green-100 border-green-400 text-green-800';
            case 'progress_update':
                return 'bg-purple-100 border-purple-400 text-purple-800';
            case 'admin_message':
                return 'bg-yellow-100 border-yellow-400 text-yellow-800';
            default:
                return 'bg-gray-100 border-gray-400 text-gray-800';
        }
    };

    return (
        <div className="fixed top-4 right-4 z-50 max-w-sm space-y-2">
            {notifications.map((notification) => (
                <div
                    key={notification.id}
                    className={`p-4 border-l-4 rounded-lg shadow-lg animate-pulse ${getNotificationColor(
                        notification.type
                    )}`}
                >
                    <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                            <span className="text-xl">{getNotificationIcon(notification.type)}</span>
                            <div className="flex-1">
                                <p className="font-medium">{notification.message}</p>
                                <p className="text-xs opacity-75 mt-1">
                                    {new Date(notification.timestamp).toLocaleTimeString()}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => removeNotification(notification.id)}
                            className="text-lg font-bold opacity-50 hover:opacity-100"
                        >
                            ×
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default NotificationCenter;
