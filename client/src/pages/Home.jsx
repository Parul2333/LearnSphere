import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useTheme } from '../contexts/ThemeContext.jsx';

// ✅ CRITICAL FIX: Use HTTPS API URL with self-signed cert bypass
const API_URL = 'https://localhost:4430/api/content';

// Configure axios to accept self-signed certificates in development
if (process.env.NODE_ENV === 'development') {
  axios.defaults.httpsAgent = { rejectUnauthorized: false };
} 

const Home = () => {
    const { isDarkMode } = useTheme();
    const [branches, setBranches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [scrollY, setScrollY] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        const handleScroll = () => setScrollY(window.scrollY);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Fetch dynamic branches from MongoDB Atlas
    useEffect(() => {
        const fetchBranches = async () => {
            try {
                // ✅ FIX: Hitting the public /api/content/branches endpoint
                const res = await axios.get(`${API_URL}/branches`); 
                setBranches(res.data);
            } catch (err) {
                console.error("Error fetching branches:", err);
                setError("Failed to load available branches. Check backend server and ensure /api/content/branches route is working.");
            } finally {
                setLoading(false);
            }
        };

        fetchBranches();
    }, []);

    const features = [
        { icon: '📚', title: 'Comprehensive Content', description: 'Access organized notes, videos, and study materials across all subjects.' },
        { icon: '🎯', title: 'Structured Learning', description: 'Content organized by branch, year, and subject for easy navigation.' },
        { icon: '📊', title: 'Progress Tracking', description: 'Monitor your learning progress with completion percentages.' },
        { icon: '🔍', title: 'Smart Search', description: 'Find content instantly with our global search feature.' },
        { icon: '🌙', title: 'Dark Mode', description: 'Comfortable viewing experience in both light and dark themes.' },
        { icon: '⚡', title: 'Fast & Reliable', description: 'Optimized performance with Redis caching for quick access.' },
    ];

    const stats = [
        { label: 'Active Users', value: '1000+' },
        { label: 'Study Materials', value: '5000+' },
        { label: 'Branches', value: '50+' },
        { label: 'Success Rate', value: '95%' },
    ];

    if (loading) {
        return <div className="text-center p-12 text-xl text-indigo-600">Loading Academic Structure...</div>;
    }

    if (error) {
        return <div className="text-center p-12 text-xl text-red-600">{error}</div>;
    }

    return (
        <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
            {/* Hero / About merged */}
            <section className="relative py-20 px-4 sm:px-6 lg:px-8">
                <div className="container mx-auto max-w-4xl text-center">
                    <h1 
                        className="text-5xl md:text-6xl font-bold mb-6 animate-fade-in-down bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent"
                        style={{ transform: `translateY(${scrollY * 0.35}px)` }}
                    >
                        Welcome to <span>LearnSphere</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 mb-8 animate-fade-in-up">
                        Your Complete Educational Hub for Organized Learning
                    </p>
                    <div className="h-1 w-24 bg-gradient-to-r from-indigo-600 to-purple-600 mx-auto rounded-full animate-pulse"></div>
                </div>
            </section>

            {/* Mission */}
            <section className={`relative py-12 px-4 sm:px-6 lg:px-8 ${isDarkMode ? 'bg-gray-800/50' : 'bg-indigo-50'} backdrop-blur-sm`}> 
                <div className="container mx-auto max-w-4xl text-center">
                    <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
                    <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                        LearnSphere is dedicated to making quality education accessible to everyone. We provide a centralized
                        platform where students can find, organize, and master academic content with ease.
                    </p>
                </div>
            </section>

            {/* Features Grid */}
            <section className="relative py-12 px-4 sm:px-6 lg:px-8">
                <div className="container mx-auto max-w-6xl">
                    <h2 className="text-3xl font-bold text-center mb-8">Why Choose LearnSphere?</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map((feature, idx) => (
                            <div key={feature.title} className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white/80 border-indigo-100'}`} style={{ transitionDelay: `${idx * 50}ms` }}>
                                <div className="text-3xl mb-2">{feature.icon}</div>
                                <h3 className="text-lg font-semibold">{feature.title}</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Explore button */}
            <div className="text-center mb-8 px-4">
                <button
                    onClick={() => navigate('/explore')}
                    className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 transition"
                >
                    Explore Branches
                </button>
            </div>

            {/* Grid Container for Branch Cards (Now linked to YearSelection) */}
            <div id="branches-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-4xl mx-auto px-4 pb-20">
                {branches.length === 0 ? (
                    <div className="text-center p-12 text-yellow-600">No academic branches have been configured by the admin yet.</div>
                ) : (
                    branches.map((branch) => (
                        <Link to={`/branch/${branch._id}`} key={branch._id} className="block transition-all duration-300 transform hover:scale-[1.03] hover:shadow-xl rounded-xl">
                            <div className="p-6 h-full rounded-xl shadow-lg bg-white border-l-4 border-indigo-500">
                                <h2 className="text-xl font-bold text-gray-800 mb-2">{branch.name}</h2>
                                <p className="text-sm text-gray-500 mt-2">Years Available: {branch.years.length}</p>
                            </div>
                        </Link>
                    ))
                )}
            </div>

            {/* Statistics Section */}
            <section className={`relative py-12 px-4 sm:px-6 lg:px-8 ${isDarkMode ? 'bg-gray-800' : 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white'}`}>
                <div className="container mx-auto max-w-4xl relative z-10 text-center">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {stats.map((stat, idx) => (
                            <div key={stat.label} className="animate-fade-in" style={{ transitionDelay: `${idx * 100}ms` }}>
                                <p className="text-2xl md:text-3xl font-bold mb-2">{stat.value}</p>
                                <p className="text-sm md:text-base opacity-90">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;