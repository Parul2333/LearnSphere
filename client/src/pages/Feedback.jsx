import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { SessionStorage } from '../utils/storageManager.js';
import { apiClient } from '../api/config.js';

const Feedback = () => {
    const { isDarkMode } = useTheme();
    const { user } = useAuth();
    
    const initialState = (() => {
        const uiState = SessionStorage.getTempUIState();
        return uiState?.feedbackDraft || { rating: 0, text: '', category: 'general' };
    })();
    
    const [rating, setRating] = useState(initialState.rating);
    const [feedbackText, setFeedbackText] = useState(initialState.text);
    const [category, setCategory] = useState(initialState.category);
    const [guestName, setGuestName] = useState('');
    const [guestEmail, setGuestEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const uiState = SessionStorage.getTempUIState();
        uiState.feedbackDraft = { rating, text: feedbackText, category };
        SessionStorage.setTempUIState(uiState);
    }, [rating, feedbackText, category]);

    const categories = ['general', 'feature-request', 'bug-report', 'improvement', 'other'];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (rating === 0) return alert('Please select a rating');
        if (!user && (!guestName || !guestEmail)) return setError('Please provide your name and email.');

        setLoading(true);

        try {
            // ✅ REAL API CALL
            await apiClient.post('/contact', {
                name: user ? user.username : guestName,
                email: user ? user.email : guestEmail,
                subject: `Feedback: ${category} (${rating} Stars)`,
                message: feedbackText,
                type: 'feedback',
                userId: user ? user._id : null
            });

            console.log('Feedback submitted successfully'); 
            setSubmitted(true);
            setRating(0); setFeedbackText(''); setCategory('general');
            setGuestName(''); setGuestEmail('');
            
            const uiState = SessionStorage.getTempUIState();
            uiState.feedbackDraft = { rating: 0, text: '', category: 'general' };
            SessionStorage.setTempUIState(uiState);
            setTimeout(() => setSubmitted(false), 5000);
        } catch (err) {
            console.error('Error submitting feedback:', err);
            setError('Failed to submit feedback.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
            <section className="py-20 text-center"><h1 className="text-5xl font-bold">Share Your Feedback</h1></section>
            <div className="container mx-auto max-w-4xl px-4 pb-12">
                <div className={`p-8 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white shadow-lg'}`}>
                    {submitted && <div className="mb-6 p-4 bg-green-100 text-green-800 rounded-lg">✅ Thank you for your feedback!</div>}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {!user && (
                            <div className="grid grid-cols-2 gap-4">
                                <input type="text" placeholder="Name" value={guestName} onChange={e => setGuestName(e.target.value)} className={`w-full px-4 py-2 rounded-lg border-2 ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50'}`} />
                                <input type="email" placeholder="Email" value={guestEmail} onChange={e => setGuestEmail(e.target.value)} className={`w-full px-4 py-2 rounded-lg border-2 ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50'}`} />
                            </div>
                        )}
                        <div className="grid grid-cols-2 gap-2">
                            {categories.map(cat => (
                                <button key={cat} type="button" onClick={() => setCategory(cat)} className={`py-2 px-3 rounded-lg text-sm font-medium ${category === cat ? 'bg-indigo-600 text-white' : isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>{cat}</button>
                            ))}
                        </div>
                        <div className="flex gap-2 text-4xl">
                            {[1, 2, 3, 4, 5].map(star => (
                                <button key={star} type="button" onClick={() => setRating(star)} className={star <= rating ? 'text-yellow-400' : 'text-gray-400'}>★</button>
                            ))}
                        </div>
                        <textarea value={feedbackText} onChange={e => setFeedbackText(e.target.value)} rows="4" placeholder="Your thoughts..." className={`w-full px-4 py-3 rounded-lg border-2 ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white'}`} required />
                        {error && <p className="text-red-500">{error}</p>}
                        <button type="submit" disabled={loading} className="w-full py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 disabled:opacity-50">{loading ? 'Submitting...' : 'Submit Feedback'}</button>
                    </form>
                </div>
            </div>
        </div>
    );
};
export default Feedback;