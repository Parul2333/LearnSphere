import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { AuthProvider } from './contexts/AuthContext.jsx';
import { NotificationProvider } from './contexts/NotificationContext.jsx'; // 💡 NEW
import { ThemeProvider } from './contexts/ThemeContext.jsx'; // 💡 NEW
import './assets/styles/global.css'; // Don't forget global styles later

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        {/* Wrap App with all providers */}
        <ThemeProvider>
            <NotificationProvider>
                <AuthProvider>
                    <App />
                </AuthProvider>
            </NotificationProvider>
        </ThemeProvider>
    </React.StrictMode>
);