import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext.jsx';

const About = () => {
    const { isDarkMode } = useTheme();
    const [scrollY, setScrollY] = useState(0);

    useEffect(() => {
        const handleScroll = () => setScrollY(window.scrollY);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const features = [
        {
            icon: '📚',
            title: 'Comprehensive Content',
            description: 'Access organized notes, videos, and study materials across all subjects.',
        },
        {
            icon: '🎯',
            title: 'Structured Learning',
            description: 'Content organized by branch, year, and subject for easy navigation.',
        },
        {
            icon: '📊',
            title: 'Progress Tracking',
            description: 'Monitor your learning progress with completion percentages.',
        },
        {
            icon: '🔍',
            title: 'Smart Search',
            description: 'Find content instantly with our global search feature.',
        },
        {
            icon: '🌙',
            title: 'Dark Mode',
            description: 'Comfortable viewing experience in both light and dark themes.',
        },
        {
            icon: '⚡',
            title: 'Fast & Reliable',
            description: 'Optimized performance with Redis caching for quick access.',
        },
    ];

    const stats = [
        { label: 'Active Users', value: '1000+' },
        { label: 'Study Materials', value: '5000+' },
        { label: 'Branches', value: '50+' },
        { label: 'Success Rate', value: '95%' },
    ];

    return (
        <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
            {/* Animated Background Blobs */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className={`absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-30 animate-blob ${isDarkMode ? 'bg-indigo-600' : 'bg-indigo-200'}`}></div>
                <div className={`absolute top-1/3 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-20 animate-blob animation-delay-2s ${isDarkMode ? 'bg-purple-600' : 'bg-purple-200'}`}></div>
                <div className={`absolute bottom-0 left-1/2 w-96 h-96 rounded-full blur-3xl opacity-20 animate-blob animation-delay-4s ${isDarkMode ? 'bg-pink-600' : 'bg-pink-200'}`}></div>
            </div>

            {/* Hero Section */}
            <section className="relative py-32 px-4 sm:px-6 lg:px-8">
                <div className="container mx-auto max-w-4xl text-center">
                    <h1 
                        className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in-down bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent"
                        style={{ transform: `translateY(${scrollY * 0.5}px)` }}
                    >
                        Welcome to <span>LearnSphere</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 mb-8 animate-fade-in-up">
                        Your Complete Educational Hub for Organized Learning
                    </p>
                    <div className="h-1 w-24 bg-gradient-to-r from-indigo-600 to-purple-600 mx-auto rounded-full animate-pulse"></div>
                </div>
            </section>

            {/* Mission Section */}
            <section className={`relative py-16 px-4 sm:px-6 lg:px-8 ${isDarkMode ? 'bg-gray-800/50' : 'bg-indigo-50'} backdrop-blur-sm`}>
                <div className="container mx-auto max-w-4xl">
                    <div 
                        className="text-center animate-fade-in"
                        style={{ transform: `translateY(${Math.max(0, 100 - scrollY * 0.3)}px)` }}
                    >
                        <h2 className="text-4xl font-bold mb-6">Our Mission</h2>
                        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                            LearnSphere is dedicated to making quality education accessible to everyone. We believe in
                            providing a centralized platform where students can find, organize, and master academic content
                            with ease. Our goal is to bridge the gap between traditional learning and modern digital education.
                        </p>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="relative py-20 px-4 sm:px-6 lg:px-8">
                <div className="container mx-auto max-w-6xl">
                    <h2 className="text-4xl font-bold text-center mb-12">Why Choose LearnSphere?</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((feature, idx) => (
                            <div
                                key={`feature-${feature.title}`}
                                className={`p-6 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-xl border-2 ${
                                    isDarkMode
                                        ? 'bg-gray-800/50 border-gray-700 hover:border-indigo-500 backdrop-blur'
                                        : 'bg-white/80 border-indigo-100 hover:border-indigo-600 backdrop-blur'
                                }`}
                                style={{ 
                                    transform: `translateY(${Math.max(0, 50 - (scrollY - 300) * 0.2)}px)`,
                                    transitionDelay: `${idx * 50}ms`
                                }}
                            >
                                <div className="text-4xl mb-4 transform group-hover:scale-125 transition-transform">{feature.icon}</div>
                                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                                <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Statistics Section */}
            <section className={`relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden ${isDarkMode ? 'bg-gray-800' : 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white'}`}>
                {/* Animated background elements */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-1/2 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-blob"></div>
                    <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-blob animation-delay-2s"></div>
                </div>

                <div className="container mx-auto max-w-4xl relative z-10">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        {stats.map((stat, idx) => (
                            <div 
                                key={`stat-${stat.label}`}
                                className="animate-fade-in"
                                style={{ transitionDelay: `${idx * 100}ms` }}
                            >
                                <p className="text-4xl md:text-5xl font-bold mb-2">{stat.value}</p>
                                <p className="text-sm md:text-base opacity-90">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Vision Section */}
            <section className="relative py-20 px-4 sm:px-6 lg:px-8">
                <div className="container mx-auto max-w-4xl text-center">
                    <h2 className="text-4xl font-bold mb-8 bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">Our Vision</h2>
                    <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-6 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
                        We envision a world where educational resources are democratized and accessible to learners everywhere.
                        LearnSphere is built by educators and students who understand the challenges of modern learning and are
                        committed to making education more efficient, engaging, and impactful.
                    </p>
                    <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
                        Join thousands of students who are already transforming their learning journey with LearnSphere.
                    </p>
                </div>
            </section>
        </div>
    );
};

export default About;
