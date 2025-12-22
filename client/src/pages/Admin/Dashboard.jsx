import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext.jsx';
import SubjectForm from '../../components/admin/SubjectForm.jsx';
import ContentForm from '../../components/admin/ContentForm.jsx';
import BranchYearManager from '../../components/admin/BranchYearManager.jsx';
import { API_BASE_URL } from '../../api/config.js';

const API_URL = API_BASE_URL;

const TABS = [
    { key: 'create_subject', name: 'Create Subject' },
    { key: 'add_content', name: 'Add Content' },
    { key: 'manage_structure', name: 'Manage Structure' },
    { key: 'manage_quotes', name: 'Quote of the Day' }, // ✅ NEW TAB
];

const AdminDashboard = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState(TABS[0].key);
    const [status, setStatus] = useState({ message: '', type: '' });
    
    // Existing State
    const [subjects, setSubjects] = useState([]);
    const [loadingSubjects, setLoadingSubjects] = useState(true);

    // ✅ New Quote State
    const [quotes, setQuotes] = useState([]);
    const [quoteText, setQuoteText] = useState('');
    const [quoteAuthor, setQuoteAuthor] = useState('');
    const [loadingQuotes, setLoadingQuotes] = useState(false);

    const showStatus = (message, type) => {
        setStatus({ message, type });
        setTimeout(() => setStatus({ message: '', type: '' }), 5000);
    };

    const StatusBox = ({ message, type }) => {
        if (!message) return null;
        return (
            <div className={`p-4 rounded-lg text-sm mb-6 font-medium ${
                type === 'success' ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
            }`}>
                {message}
            </div>
        );
    };

    // --- FETCH DATA ---
    const fetchSubjects = async () => {
        setLoadingSubjects(true);
        try {
            const res = await axios.get(`${API_URL}/content/subjects`);
            setSubjects(res.data);
        } catch (error) {
            console.error("Failed to fetch subjects.", error);
        } finally {
            setLoadingSubjects(false);
        }
    };

    const fetchQuotes = async () => {
        setLoadingQuotes(true);
        try {
            const res = await axios.get(`${API_URL}/quotes`, { withCredentials: true });
            setQuotes(res.data);
        } catch (error) {
            console.error("Failed to fetch quotes", error);
        } finally {
            setLoadingQuotes(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'create_subject' || activeTab === 'add_content') fetchSubjects();
        if (activeTab === 'manage_quotes') fetchQuotes();
    }, [activeTab, status.type]);

    // --- QUOTE HANDLERS ---
    const handleAddQuote = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API_URL}/quotes`, { text: quoteText, author: quoteAuthor }, { withCredentials: true });
            showStatus('Quote added!', 'success');
            setQuoteText(''); setQuoteAuthor(''); fetchQuotes();
        } catch (error) {
            showStatus('Failed to add quote.', 'error');
        }
    };

    const handleToggleQuote = async (id, currentStatus) => {
        try {
            await axios.put(`${API_URL}/quotes/${id}/toggle`, { select: !currentStatus }, { withCredentials: true });
            fetchQuotes();
            showStatus(currentStatus ? 'Quote unselected.' : 'Quote set as Active!', 'success');
        } catch (error) {
            showStatus('Update failed.', 'error');
        }
    };

    const handleDeleteQuote = async (id) => {
        if (!window.confirm("Delete this quote?")) return;
        try {
            await axios.delete(`${API_URL}/quotes/${id}`, { withCredentials: true });
            fetchQuotes();
            showStatus('Quote deleted.', 'success');
        } catch (error) {
            showStatus('Delete failed.', 'error');
        }
    };

    // --- RENDER LOGIC ---
    const renderForm = () => {
        if (loadingSubjects && (activeTab === 'create_subject' || activeTab === 'add_content')) return <div>Loading...</div>;

        if (activeTab === 'create_subject') return <SubjectForm showStatus={showStatus} onSubjectCreated={() => showStatus('Subject created!', 'success')} />;
        if (activeTab === 'add_content') return <ContentForm showStatus={showStatus} subjects={subjects} />;
        if (activeTab === 'manage_structure') return <BranchYearManager showStatus={showStatus} />;
        
        // ✅ Quote Management UI
        if (activeTab === 'manage_quotes') {
            return (
                <div>
                    <h2 className="text-2xl font-bold mb-4 text-gray-800">Manage Quotes</h2>
                    <form onSubmit={handleAddQuote} className="bg-gray-50 p-6 rounded-lg mb-8 border">
                        <div className="flex flex-col gap-4">
                            <textarea 
                                className="w-full p-3 rounded border" 
                                placeholder="Enter Quote..." 
                                value={quoteText} 
                                onChange={e => setQuoteText(e.target.value)} 
                                required 
                            />
                            <input 
                                className="w-full p-3 rounded border" 
                                placeholder="Author" 
                                value={quoteAuthor} 
                                onChange={e => setQuoteAuthor(e.target.value)} 
                            />
                            <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700 w-fit">Add Quote</button>
                        </div>
                    </form>

                    <h3 className="text-lg font-semibold mb-4">Existing Quotes</h3>
                    {loadingQuotes ? <p>Loading...</p> : (
                        <div className="grid gap-4">
                            {quotes.map(q => (
                                <div key={q._id} className={`p-4 rounded border-l-4 flex justify-between items-center ${q.isSelected ? 'border-green-500 bg-green-50' : 'border-gray-300 bg-white'}`}>
                                    <div>
                                        <p className="font-medium italic">"{q.text}"</p>
                                        <p className="text-sm text-gray-600">— {q.author || 'Unknown'}</p>
                                        {q.isSelected && <span className="text-xs bg-green-200 text-green-800 px-2 rounded mt-1 inline-block">DISPLAYED NOW</span>}
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => handleToggleQuote(q._id, q.isSelected)} className={`px-3 py-1 rounded text-white text-sm ${q.isSelected ? 'bg-yellow-500' : 'bg-green-600'}`}>
                                            {q.isSelected ? 'Unselect' : 'Force Show'}
                                        </button>
                                        <button onClick={() => handleDeleteQuote(q._id)} className="px-3 py-1 bg-red-600 text-white rounded text-sm">Delete</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            );
        }
        return <div>Select a section.</div>;
    };

    return (
        <div className="py-8">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Admin Dashboard 🛠️</h1>
            <p className="text-lg text-indigo-600 mb-8">Welcome, {user?.username}.</p>
            <StatusBox message={status.message} type={status.type} />
            
            <div className="border-b border-gray-200 mb-6 overflow-x-auto">
                <nav className="-mb-px flex space-x-8">
                    {TABS.map(tab => (
                        <button key={tab.key} onClick={() => { setActiveTab(tab.key); setStatus({ message: '', type: '' }); }}
                            className={`${activeTab === tab.key ? 'border-indigo-500 text-indigo-600 font-semibold' : 'border-transparent text-gray-500 hover:text-gray-700'} whitespace-nowrap py-3 px-1 border-b-2 text-lg`}>
                            {tab.name}
                        </button>
                    ))}
                </nav>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-xl">{renderForm()}</div>
        </div>
    );
};

export default AdminDashboard;