import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { AuthProvider } from './contexts/AuthContext.jsx'; 
import './assets/styles/global.css'; // Don't forget global styles later

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        {/* Wrap App with AuthProvider */}
        <AuthProvider>
            <App />
        </AuthProvider>
    </React.StrictMode>
);