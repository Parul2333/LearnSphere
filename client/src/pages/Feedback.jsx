import React, { useState } from 'react';
import axios from 'axios';
import { useTheme } from '../contexts/ThemeContext.jsx';

const Feedback = () => {
    const { isDarkMode } = useTheme();
    const [rating, setRating] = useState(0);
    const [feedbackText, setFeedbackText] = useState('');
    const [category, setCategory] = useState('general');
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    const categories = ['general', 'feature-request', 'bug-report', 'improvement', 'other'];

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rating === 0) {
            alert('Please select a rating');
            return;
        }

        setLoading(true);
        try {
            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 1500));
            console.log('Feedback submitted:', { rating, feedbackText, category });
            setSubmitted(true);
            setRating(0);
            setFeedbackText('');
            setCategory('general');
            setTimeout(() => setSubmitted(false), 5000);
        } catch (error) {
            console.error('Error submitting feedback:', error);
        } finally {
            setLoading(false);
        }
    };

    const feedbackExamples = [
        {
            icon: '⭐',
            title: 'Excellent Experience',
            description: 'LearnSphere helped me ace my exams with organized content!',
            author: 'Student A',
        },
        {
            icon: '👍',
            title: 'Very Helpful',
            description: 'The search feature is incredibly useful for finding specific topics.',
            author: 'Student B',
        },
        {
            icon: '🎯',
            title: 'Perfect Organization',
            description: 'Content is well-structured and easy to navigate.',
            author: 'Student C',
        },
    ];

    return (
        <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
            {/* Animated Background Blobs */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className={`absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-30 animate-blob ${isDarkMode ? 'bg-purple-600' : 'bg-purple-200'}`}></div>
                <div className={`absolute top-1/2 right-0 w-96 h-96 rounded-full blur-3xl opacity-20 animate-blob animation-delay-2s ${isDarkMode ? 'bg-pink-600' : 'bg-pink-200'}`}></div>
            </div>

            {/* Hero Section */}
            <section className="relative py-20 px-4 sm:px-6 lg:px-8">
                <div className="container mx-auto max-w-4xl text-center">
                    <h1 
                        className="text-5xl md:text-6xl font-bold mb-6 animate-fade-in-down bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent"
                    >
                        Share Your Feedback
                    </h1>
                    <p className="text-xl text-gray-600 dark:text-gray-400 animate-fade-in-up">
                        Help us improve LearnSphere by sharing your thoughts and suggestions. Your feedback matters!
                    </p>
                </div>
            </section>

            <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid md:grid-cols-2 gap-12">
                    {/* Feedback Form */}
                    <div className={`p-8 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white shadow-lg'}`}>
                        <h2 className="text-3xl font-bold mb-6">Tell Us What You Think</h2>

                        {submitted && (
                            <div className="mb-6 p-4 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-lg animate-pulse">
                                ✅ Thank you for your feedback! We appreciate your input.
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Category Selection */}
                            <div>
                                <label htmlFor="feedback-category" className="block text-sm font-medium mb-3">Feedback Category</label>
                                <div id="feedback-category" className="grid grid-cols-2 gap-2">
                                    {categories.map((cat) => {
                                        const isActive = category === cat;
                                        const darkBg = isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300';
                                        const bgClass = isActive ? 'bg-indigo-600 text-white scale-105' : darkBg;
                                        return (
                                            <button
                                                key={cat}
                                                type="button"
                                                onClick={() => setCategory(cat)}
                                                className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${bgClass}`}
                                            >
                                                {cat.replace('-', ' ')}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Star Rating */}
                            <div>
                                <label htmlFor="rating-stars" className="block text-sm font-medium mb-3">How would you rate us?</label>
                                <div id="rating-stars" className="flex gap-2 text-4xl">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={`star-${star}`}
                                            type="button"
                                            onClick={() => setRating(star)}
                                            className={`transition-all transform hover:scale-125 ${
                                                star <= rating ? 'text-yellow-400' : 'text-gray-400'
                                            }`}
                                        >
                                            ★
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Feedback Text */}
                            <div>
                                <label htmlFor="feedback-text" className="block text-sm font-medium mb-2">Your Feedback</label>
                                <textarea
                                    id="feedback-text"
                                    value={feedbackText}
                                    onChange={(e) => setFeedbackText(e.target.value)}
                                    required
                                    rows="6"
                                    className={`w-full px-4 py-3 rounded-lg border-2 transition-colors focus:outline-none focus:border-indigo-600 ${
                                        isDarkMode
                                            ? 'bg-gray-700 border-gray-600 text-white'
                                            : 'bg-white border-gray-300 text-gray-900'
                                    }`}
                                    placeholder="Tell us what you think..."
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 px-6 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400 transition-colors duration-300 transform hover:scale-105 active:scale-95"
                            >
                                {loading ? '📤 Submitting...' : '📤 Submit Feedback'}
                            </button>
                        </form>
                    </div>

                    {/* User Feedback Examples */}
                    <div className="space-y-6">
                        <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">What Users Say</h2>
                        {feedbackExamples.map((feedback) => (
                            <div
                                key={`feedback-${feedback.title}`}
                                className={`p-6 rounded-xl transition-all duration-300 hover:scale-105 border-2 backdrop-blur ${
                                    isDarkMode ? 'bg-gray-800/50 border-gray-700 hover:border-purple-500' : 'bg-white/80 shadow-lg border-indigo-100 hover:border-indigo-600'
                                }`}
                            >
                                <div className="text-4xl mb-3">{feedback.icon}</div>
                                <h3 className="text-lg font-semibold mb-2">{feedback.title}</h3>
                                <p className="text-gray-600 dark:text-gray-400 mb-3">"{feedback.description}"</p>
                                <p className="text-sm text-indigo-600 dark:text-indigo-400 font-medium">— {feedback.author}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* FAQ Section */}
            <section className={`py-16 px-4 sm:px-6 lg:px-8 mt-8 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                <div className="container mx-auto max-w-4xl">
                    <h2 className="text-4xl font-bold text-center mb-12">Frequently Asked Questions</h2>
                    <div className="space-y-4">
                        {[
                            {
                                q: 'How often do you update based on feedback?',
                                a: 'We review feedback weekly and implement improvements based on user requests.',
                            },
                            {
                                q: 'Will my feedback be kept confidential?',
                                a: 'Yes, we keep all personal information confidential and only use feedback to improve our platform.',
                            },
                            {
                                q: 'Can I track my feedback status?',
                                a: 'We\'ll email you updates on features you requested. Keep an eye on your inbox!',
                            },
                        ].map((faq) => (
                            <div
                                key={`faq-${faq.q}`}
                                className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-white'}`}
                            >
                                <h3 className="font-semibold text-lg mb-2">{faq.q}</h3>
                                <p className="text-gray-600 dark:text-gray-400">{faq.a}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Feedback;
