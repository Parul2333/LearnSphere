import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx'; // Import the Auth context

const Navbar = () => {
    const { user, isAdmin, logout } = useAuth();

    return (
        <header className="bg-white shadow-md sticky top-0 z-10">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
                
                {/* Logo / Home Link */}
                <Link to="/" className="text-2xl font-bold text-indigo-600 hover:text-indigo-800 transition-colors duration-200">
                    LearnSphere
                </Link>

                {/* Navigation Links */}
                <nav className="flex items-center space-x-4">
                    
                    {/* Admin Dashboard Link (Visible only to Admin) */}
                    {isAdmin && (
                        <Link to="/admin/dashboard" className="text-sm font-medium text-red-600 hover:text-red-800 transition-colors duration-200">
                            Admin Dashboard ⚙️
                        </Link>
                    )}

                    {/* User Profile / Status */}
                    {user ? (
                        // --- Logged In View ---
                        <>
                            <span className="text-sm font-medium text-gray-700 hidden sm:inline">
                                Welcome, **{user.username}**!
                            </span>
                            <button 
                                onClick={logout} 
                                className="px-3 py-1 text-sm font-medium text-white bg-gray-500 rounded-md hover:bg-gray-600 transition-colors duration-200"
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        // --- Logged Out View (Login & Sign Up) ---
                        <>
                            {/* Login Link */}
                            <Link 
                                to="/login" 
                                className="px-3 py-1 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors duration-200"
                            >
                                Login
                            </Link>
                            
                            {/* Sign Up Link (New Addition) */}
                            <Link 
                                to="/signup" 
                                className="px-3 py-1 text-sm font-medium text-indigo-600 border border-indigo-600 rounded-md hover:bg-indigo-50 transition-colors duration-200"
                            >
                                Sign Up
                            </Link>
                        </>
                    )}
                </nav>
            </div>
        </header>
    );
};

export default Navbar;