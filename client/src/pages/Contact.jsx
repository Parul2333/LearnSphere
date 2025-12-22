import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { apiClient } from '../api/config.js';

const Contact = () => {
    const { isDarkMode } = useTheme();
    const { user } = useAuth();
    const [scrollY, setScrollY] = useState(0);
    
    const [formData, setFormData] = useState({
        name: '', email: '', subject: '', message: '',
    });
    
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const handleScroll = () => setScrollY(window.scrollY);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Auto-fill if logged in
    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                name: user.username || '',
                email: user.email || ''
            }));
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // ✅ REAL API CALL
            await apiClient.post('/contact', {
                ...formData,
                type: 'contact',
                userId: user?._id || null
            });

            // This is the log message that proves the new code is running
            console.log('Contact form sent successfully'); 
            
            setSubmitted(true);
            setFormData({ 
                name: user ? user.username : '', 
                email: user ? user.email : '', 
                subject: '', message: '' 
            });
            setTimeout(() => setSubmitted(false), 5000);
        } catch (err) {
            console.error('Error submitting form:', err);
            setError('Failed to send message. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const contactMethods = [
        { icon: '📧', title: 'Email', info: 'support@learnsphere.com', description: 'We reply within 24 hours' },
        { icon: '💬', title: 'Live Chat', info: 'Available 24/7', description: 'Chat with our support team' },
        { icon: '📱', title: 'Phone', info: '+1 (555) 123-4567', description: 'Call us during business hours' },
        { icon: '📍', title: 'Location', info: 'Silicon Valley, USA', description: 'Visit our office' },
    ];

    return (
        <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
            <section className="relative py-20 px-4 sm:px-6 lg:px-8">
                <div className="container mx-auto max-w-4xl text-center">
                    <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">Get in Touch</h1>
                </div>
            </section>

            <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12 grid md:grid-cols-2 gap-12">
                <div className={`p-8 rounded-xl backdrop-blur border-2 ${isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white/80 border-indigo-100 shadow-lg'}`}>
                    <h2 className="text-3xl font-bold mb-6">Send us a Message</h2>
                    {submitted && <div className="mb-6 p-4 bg-green-100 text-green-800 rounded-lg">✅ Message sent!</div>}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="Your name" className={`w-full px-4 py-3 rounded-lg border-2 ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white'}`} />
                        <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="Email" className={`w-full px-4 py-3 rounded-lg border-2 ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white'}`} />
                        <input type="text" name="subject" value={formData.subject} onChange={handleChange} required placeholder="Subject" className={`w-full px-4 py-3 rounded-lg border-2 ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white'}`} />
                        <textarea name="message" value={formData.message} onChange={handleChange} required rows="5" placeholder="Message..." className={`w-full px-4 py-3 rounded-lg border-2 ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white'}`} />
                        {error && <p className="text-red-500">{error}</p>}
                        <button type="submit" disabled={loading} className="w-full py-3 px-6 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                            {loading ? 'Sending...' : 'Send Message'}
                        </button>
                    </form>
                </div>
                <div className="space-y-6">
                    {contactMethods.map((method, idx) => (
                        <div key={idx} className={`p-6 rounded-xl border-2 ${isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white/80 shadow-lg border-indigo-100'}`}>
                            <div className="text-4xl mb-3">{method.icon}</div>
                            <h3 className="text-xl font-semibold">{method.title}</h3>
                            <p className="text-indigo-600 dark:text-indigo-400">{method.info}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
export default Contact;