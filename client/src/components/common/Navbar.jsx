import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useTheme } from '../../contexts/ThemeContext.jsx'; // 💡 NEW
import SearchBar from './SearchBar.jsx'; // 💡 NEW
import ThemeToggle from './ThemeToggle.jsx'; // 💡 NEW

const Navbar = () => {
    const { user, logout, isAdmin } = useAuth();
    const { isDarkMode } = useTheme();
    const navigate = useNavigate();
    const [showSearchModal, setShowSearchModal] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/');
        setShowMobileMenu(false);
    };

    const navLinks = [
        { name: 'Home', path: '/', icon: '🏠' },
        { name: 'Contact', path: '/contact', icon: '📞' },
        { name: 'Feedback', path: '/feedback', icon: '💬' },
    ];

    return (
        <nav className={`${isDarkMode ? 'bg-gray-800/95 text-white border-b border-gray-700' : 'bg-white/95 text-gray-900 border-b border-gray-200'} shadow-lg backdrop-blur-sm sticky top-0 z-50`}>
            <div className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                    {/* Logo/Brand */}
                    <Link to="/" className="flex items-center gap-2 text-2xl font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors group">
                        <span className="text-3xl group-hover:scale-110 transition-transform">📚</span>
                        <span className="hidden sm:inline">LearnSphere</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden lg:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className="flex items-center gap-1 text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium group"
                            >
                                <span className="group-hover:scale-125 transition-transform">{link.icon}</span>
                                {link.name}
                            </Link>
                        ))}
                    </div>

                    {/* Center: Search Bar */}
                    <div className="flex-1 mx-4 max-w-md hidden md:block">
                        <button
                            onClick={() => setShowSearchModal(!showSearchModal)}
                            className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            🔍 Search content...
                        </button>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-4">
                        {/* Mobile Search Toggle */}
                        <button
                            onClick={() => setShowSearchModal(!showSearchModal)}
                            className="md:hidden text-2xl hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors transform hover:scale-110"
                            title="Search"
                        >
                            🔍
                        </button>

                        {/* Theme Toggle */}
                        <ThemeToggle />

                        {/* Admin Links */}
                        {user && isAdmin && (
                            <div className="hidden sm:flex gap-2">
                                <Link
                                    to="/admin/dashboard"
                                    className="px-3 py-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-sm hover:bg-indigo-200 dark:hover:bg-indigo-800 transition-all transform hover:scale-105 font-medium"
                                    title="Admin Dashboard"
                                >
                                    🛠️
                                </Link>
                                <Link
                                    to="/admin/analytics"
                                    className="px-3 py-2 rounded-lg bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 text-sm hover:bg-purple-200 dark:hover:bg-purple-800 transition-all transform hover:scale-105 font-medium"
                                    title="Analytics"
                                >
                                    📊
                                </Link>
                            </div>
                        )}

                        {/* Auth Links */}
                        {user ? (
                            <div className="hidden sm:flex items-center gap-3">
                                <span className="text-sm font-medium">👤 {user.username.substring(0, 8)}</span>
                                <button
                                    onClick={handleLogout}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all transform hover:scale-105 active:scale-95 text-sm font-medium"
                                >
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <div className="hidden sm:flex gap-2">
                                <Link
                                    to="/login"
                                    className="px-4 py-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 text-sm font-medium transition-colors"
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/signup"
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all transform hover:scale-105 text-sm font-medium"
                                >
                                    Sign Up
                                </Link>
                            </div>
                        )}

                        {/* Mobile Menu Toggle */}
                        <button
                            onClick={() => setShowMobileMenu(!showMobileMenu)}
                            className="lg:hidden text-2xl hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                        >
                            {showMobileMenu ? '✕' : '☰'}
                        </button>
                    </div>
                </div>

                {/* Search Modal */}
                {showSearchModal && (
                    <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg animate-fade-in">
                        <SearchBar />
                        <button
                            onClick={() => setShowSearchModal(false)}
                            className="mt-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                        >
                            ✕ Close
                        </button>
                    </div>
                )}

                {/* Mobile Menu */}
                {showMobileMenu && (
                    <div className="lg:hidden mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg space-y-3 animate-fade-in">
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 rounded-lg transition-colors"
                                onClick={() => setShowMobileMenu(false)}
                            >
                                {link.icon} {link.name}
                            </Link>
                        ))}

                        {user ? (
                            <>
                                {isAdmin && (
                                    <>
                                        <Link
                                            to="/admin/dashboard"
                                            className="block px-4 py-2 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 rounded-lg transition-colors font-medium"
                                            onClick={() => setShowMobileMenu(false)}
                                        >
                                            🛠️ Admin Dashboard
                                        </Link>
                                        <Link
                                            to="/admin/analytics"
                                            className="block px-4 py-2 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/50 rounded-lg transition-colors font-medium"
                                            onClick={() => setShowMobileMenu(false)}
                                        >
                                            📊 Analytics
                                        </Link>
                                    </>
                                )}
                                <button
                                    onClick={handleLogout}
                                    className="w-full px-4 py-2 text-left text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-lg transition-colors font-medium"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    className="block px-4 py-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 rounded-lg transition-colors font-medium"
                                    onClick={() => setShowMobileMenu(false)}
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/signup"
                                    className="block px-4 py-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 rounded-lg transition-colors font-medium"
                                    onClick={() => setShowMobileMenu(false)}
                                >
                                    Sign Up
                                </Link>
                            </>
                        )}
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;