// client/src/App.jsx

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext.jsx'; 

// --- Import Page Components ---
import Home from './pages/Home.jsx';
import SubjectList from './pages/SubjectList.jsx';
import SubjectDetail from './pages/SubjectDetail.jsx';
import AdminDashboard from './pages/Admin/Dashboard.jsx';
import LoginForm from './components/auth/LoginForm.jsx'; 
import Navbar from './components/common/Navbar.jsx';
import Signup from './pages/Signup.jsx'; 
import YearSelection from './pages/YearSelection.jsx'; // 💡 NEW IMPORT

// --- Protected Route Components ---
const AdminRoute = ({ element: Element }) => {
    const { isAdmin, loading } = useAuth();
    
    if (loading) return <div className="p-10 text-center text-blue-600">Loading Admin Access...</div>; 
    
    // If not admin, redirect to login
    return isAdmin ? <Element /> : <Navigate to="/login" replace />; 
};

const App = () => {
    return (
        <Router>
            <div className="min-h-screen">
                <Navbar />
                <main className="p-4 container mx-auto">
                    <Routes>
                        {/* Public Routes */}
                        <Route path="/" element={<Home />} />
                        <Route path="/login" element={<LoginForm />} />
                        <Route path="/signup" element={<Signup />} />
                        
                        {/* 1. Branch Selection Redirects to Year Selection */}
                        <Route path="/branch/:branchId" element={<YearSelection />} /> 
                        
                        {/* 2. Year Selection Redirects to Subject List */}
                        <Route path="/branch/:branchId/year/:yearName" element={<SubjectList />} /> 
                        
                        {/* 3. Subject Detail */}
                        <Route path="/subject/:id" element={<SubjectDetail />} />

                        {/* Admin Routes (Secured) */}
                        <Route path="/admin/dashboard" element={<AdminRoute element={AdminDashboard} />} />
                        
                        {/* Fallback route for 404s */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </main>
            </div>
        </Router>
    );
};

export default App;