import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useTheme } from '../contexts/ThemeContext.jsx';
import { API_BASE_URL } from '../api/config.js';

const API_URL = `${API_BASE_URL}/content`; 

const Home = () => {
    const { isDarkMode } = useTheme();
    const [branches, setBranches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [scrollY, setScrollY] = useState(0);
    const [dailyQuote, setDailyQuote] = useState(null); // ✅ State for Quote
    const navigate = useNavigate();

    useEffect(() => {
        const handleScroll = () => setScrollY(window.scrollY);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // ✅ Fetch Quote of the Day
    useEffect(() => {
        const fetchQuote = async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/quotes/daily`);
                setDailyQuote(res.data);
            } catch (err) {
                console.error("Quote fetch error (ignoring if none exist):", err);
            }
        };
        fetchQuote();
    }, []);

    // Fetch Branches
    useEffect(() => {
        const fetchBranches = async () => {
            try {
                console.log(`[Home] Fetching branches from: ${API_URL}/branches`);
                // ✅ FIX: Hitting the public /api/content/branches endpoint
                const res = await axios.get(`${API_URL}/branches`); 
                console.log(`[Home] Branches loaded:`, res.data);
                setBranches(res.data || []);
            } catch (err) {
                console.error("Error fetching branches:", err);
                let errorMessage = "Failed to load branches.";
                if (err.code === 'ERR_NETWORK') errorMessage += " Network Error.";
                setError(errorMessage);
            } finally {
                setLoading(false);
            }
        };

        fetchBranches();
    }, []);

    const features = [
        { icon: '📚', title: 'Comprehensive Content', description: 'Access organized notes, videos, and study materials.' },
        { icon: '🎯', title: 'Structured Learning', description: 'Organized by branch, year, and subject.' },
        { icon: '📊', title: 'Progress Tracking', description: 'Monitor your learning progress.' },
        { icon: '🔍', title: 'Smart Search', description: 'Find content instantly.' },
        { icon: '🌙', title: 'Dark Mode', description: 'Comfortable viewing experience.' },
        { icon: '⚡', title: 'Fast & Reliable', description: 'Optimized performance.' },
    ];

    const stats = [
        { label: 'Active Users', value: '1000+' },
        { label: 'Study Materials', value: '5000+' },
        { label: 'Branches', value: '50+' },
        { label: 'Success Rate', value: '95%' },
    ];

    if (loading) return <div className="text-center p-12 text-xl text-indigo-600">Loading...</div>;
    if (error) return <div className="text-center p-12 text-xl text-red-600">{error}</div>;

    return (
        <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
            {/* Hero */}
            <section className="relative py-20 px-4 text-center">
                <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent"
                    style={{ transform: `translateY(${scrollY * 0.35}px)` }}>
                    Welcome to <span>LearnSphere</span>
                </h1>
                <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 mb-8">
                    Your Complete Educational Hub for Organized Learning
                </p>
                <div className="h-1 w-24 bg-gradient-to-r from-indigo-600 to-purple-600 mx-auto rounded-full"></div>
            </section>

            {/* ✅ Quote of the Day Section */}
            {dailyQuote && (
                <section className="py-8 px-4">
                    <div className={`max-w-4xl mx-auto text-center p-8 rounded-2xl relative overflow-hidden transition-all duration-300 transform hover:scale-[1.01] ${isDarkMode ? 'bg-gray-800 border border-indigo-500/30' : 'bg-gradient-to-r from-indigo-50 to-purple-50 shadow-lg border border-indigo-100'}`}>
                        <span className="text-6xl absolute top-4 left-4 opacity-10 font-serif">"</span>
                        <h2 className={`text-sm font-bold mb-4 uppercase tracking-widest ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>✨ Quote of the Day</h2>
                        <p className={`text-2xl md:text-3xl font-serif italic mb-6 leading-relaxed ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>"{dailyQuote.text}"</p>
                        <div className="flex justify-center items-center gap-2">
                            <div className={`h-px w-8 ${isDarkMode ? 'bg-indigo-500' : 'bg-indigo-300'}`}></div>
                            <p className={`text-lg font-medium ${isDarkMode ? 'text-indigo-300' : 'text-indigo-600'}`}>{dailyQuote.author || 'Unknown'}</p>
                            <div className={`h-px w-8 ${isDarkMode ? 'bg-indigo-500' : 'bg-indigo-300'}`}></div>
                        </div>
                        <span className="text-6xl absolute bottom-0 right-4 opacity-10 font-serif" style={{transform: 'rotate(180deg)'}}>"</span>
                    </div>
                </section>
            )}

            {/* Mission */}
            <section className={`py-12 px-4 text-center ${isDarkMode ? 'bg-gray-800/50' : 'bg-indigo-50'}`}> 
                <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
                <p className="text-lg max-w-4xl mx-auto">LearnSphere is dedicated to making quality education accessible to everyone.</p>
            </section>

            {/* Features */}
            <section className="py-12 px-4">
                <div className="container mx-auto max-w-6xl">
                    <h2 className="text-3xl font-bold text-center mb-8">Why Choose LearnSphere?</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {features.map((feature, idx) => (
                            <div key={idx} className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white/80 border-indigo-100'}`}>
                                <div className="text-3xl mb-2">{feature.icon}</div>
                                <h3 className="text-lg font-semibold">{feature.title}</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Explore Button */}
            <div className="text-center mb-8">
                <button onClick={() => navigate('/explore')} className="bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 transition">Explore Branches</button>
            </div>

            {/* Branch Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-4xl mx-auto px-4 pb-20">
                {branches.length === 0 ? <div className="text-center p-12 text-yellow-600">No branches configured.</div> : 
                    branches.map((branch) => (
                        <Link to={`/branch/${branch._id}`} key={branch._id} className="block hover:scale-[1.03] transition-all">
                            <div className="p-6 h-full rounded-xl shadow-lg bg-white border-l-4 border-indigo-500">
                                <h2 className="text-xl font-bold text-gray-800 mb-2">{branch.name}</h2>
                                <p className="text-sm text-gray-500">Years: {branch.years.length}</p>
                            </div>
                        </Link>
                    ))
                }
            </div>

            {/* Stats */}
            <section className={`py-12 px-4 text-center ${isDarkMode ? 'bg-gray-800' : 'bg-gradient-to-r from-indigo-600 to-pink-600 text-white'}`}>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
                    {stats.map((stat, idx) => (
                        <div key={idx}>
                            <p className="text-2xl font-bold">{stat.value}</p>
                            <p className="text-sm opacity-90">{stat.label}</p>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default Home;