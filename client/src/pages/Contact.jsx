import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTheme } from '../contexts/ThemeContext.jsx';

const Contact = () => {
    const { isDarkMode } = useTheme();
    const [scrollY, setScrollY] = useState(0);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: '',
    });
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrollY(window.scrollY);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Simulate API call - in production, you'd send this to a backend
            await new Promise((resolve) => setTimeout(resolve, 1500));
            console.log('Contact form submitted:', formData);
            setSubmitted(true);
            setFormData({ name: '', email: '', subject: '', message: '' });
            setTimeout(() => setSubmitted(false), 5000);
        } catch (error) {
            console.error('Error submitting form:', error);
        } finally {
            setLoading(false);
        }
    };

    const contactMethods = [
        {
            icon: '📧',
            title: 'Email',
            info: 'support@learnsphere.com',
            description: 'We reply within 24 hours',
        },
        {
            icon: '💬',
            title: 'Live Chat',
            info: 'Available 24/7',
            description: 'Chat with our support team',
        },
        {
            icon: '📱',
            title: 'Phone',
            info: '+1 (555) 123-4567',
            description: 'Call us during business hours',
        },
        {
            icon: '📍',
            title: 'Location',
            info: 'Silicon Valley, USA',
            description: 'Visit our office',
        },
    ];

    return (
        <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
            {/* Animated Background Blobs */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className={`absolute top-0 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-30 animate-blob ${isDarkMode ? 'bg-indigo-600' : 'bg-indigo-200'}`}></div>
                <div className={`absolute top-1/3 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-20 animate-blob animation-delay-2s ${isDarkMode ? 'bg-purple-600' : 'bg-purple-200'}`}></div>
            </div>

            {/* Hero Section */}
            <section className="relative py-20 px-4 sm:px-6 lg:px-8">
                <div className="container mx-auto max-w-4xl text-center">
                    <h1 
                        className="text-5xl md:text-6xl font-bold mb-6 animate-fade-in-down bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent"
                        style={{ transform: `translateY(${scrollY * 0.5}px)` }}
                    >
                        Get in Touch
                    </h1>
                    <p className="text-xl text-gray-600 dark:text-gray-400 animate-fade-in-up">
                        Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
                    </p>
                </div>
            </section>

            <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12 grid md:grid-cols-2 gap-12">
                {/* Contact Form */}
                <div className={`p-8 rounded-xl backdrop-blur border-2 ${isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white/80 border-indigo-100 shadow-lg'}`}>
                    <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">Send us a Message</h2>

                    {submitted && (
                        <div className="mb-6 p-4 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-lg animate-pulse border-2 border-green-400 dark:border-green-600">
                            ✅ Thank you! We've received your message and will get back to you soon.
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium mb-2">Name</label>
                            <input
                                id="name"
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className={`w-full px-4 py-3 rounded-lg border-2 transition-colors focus:outline-none focus:border-indigo-600 ${
                                    isDarkMode
                                        ? 'bg-gray-700 border-gray-600 text-white'
                                        : 'bg-white border-gray-300 text-gray-900'
                                }`}
                                placeholder="Your name"
                            />
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium mb-2">Email</label>
                            <input
                                id="email"
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className={`w-full px-4 py-3 rounded-lg border-2 transition-colors focus:outline-none focus:border-indigo-600 ${
                                    isDarkMode
                                        ? 'bg-gray-700 border-gray-600 text-white'
                                        : 'bg-white border-gray-300 text-gray-900'
                                }`}
                                placeholder="your.email@example.com"
                            />
                        </div>

                        <div>
                            <label htmlFor="subject" className="block text-sm font-medium mb-2">Subject</label>
                            <input
                                id="subject"
                                type="text"
                                name="subject"
                                value={formData.subject}
                                onChange={handleChange}
                                required
                                className={`w-full px-4 py-3 rounded-lg border-2 transition-colors focus:outline-none focus:border-indigo-600 ${
                                    isDarkMode
                                        ? 'bg-gray-700 border-gray-600 text-white'
                                        : 'bg-white border-gray-300 text-gray-900'
                                }`}
                                placeholder="How can we help?"
                            />
                        </div>

                        <div>
                            <label htmlFor="message" className="block text-sm font-medium mb-2">Message</label>
                            <textarea
                                id="message"
                                name="message"
                                value={formData.message}
                                onChange={handleChange}
                                required
                                rows="5"
                                className={`w-full px-4 py-3 rounded-lg border-2 transition-colors focus:outline-none focus:border-indigo-600 ${
                                    isDarkMode
                                        ? 'bg-gray-700 border-gray-600 text-white'
                                        : 'bg-white border-gray-300 text-gray-900'
                                }`}
                                placeholder="Your message..."
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 px-6 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400 transition-colors duration-300 transform hover:scale-105 active:scale-95"
                        >
                            {loading ? '✉️ Sending...' : '📨 Send Message'}
                        </button>
                    </form>
                </div>

                {/* Contact Methods */}
                <div className="space-y-6">
                    <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">Other Ways to Reach Us</h2>
                    {contactMethods.map((method) => (
                        <div
                            key={`contact-${method.title}`}
                            className={`p-6 rounded-xl transition-all duration-300 hover:scale-105 border-2 backdrop-blur ${
                                isDarkMode ? 'bg-gray-800/50 border-gray-700 hover:border-indigo-500' : 'bg-white/80 shadow-lg border-indigo-100 hover:border-indigo-600'
                            }`}
                        >
                            <div className="text-4xl mb-3">{method.icon}</div>
                            <h3 className="text-xl font-semibold mb-2">{method.title}</h3>
                            <p className="text-indigo-600 dark:text-indigo-400 font-medium mb-1">{method.info}</p>
                            <p className="text-gray-600 dark:text-gray-400 text-sm">{method.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Contact;
