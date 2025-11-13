import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext.jsx';
// Import the required child components for forms
import SubjectForm from '../../components/admin/SubjectForm.jsx';
import ContentForm from '../../components/admin/ContentForm.jsx';
// 🛠️ NEW COMPONENT IMPORT: For managing branches/years dynamically
import BranchYearManager from '../../components/admin/BranchYearManager.jsx';

const API_URL = 'http://localhost:5000/api';

// Define the tabs for navigation, including the new structure manager
const TABS = [
    { key: 'create_subject', name: 'Create Subject' },
    { key: 'add_content', name: 'Add Content' },
    { key: 'manage_structure', name: 'Manage Structure' }, // ✅ NEW TAB
];

const AdminDashboard = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState(TABS[0].key);
    const [subjects, setSubjects] = useState([]); // List of all subjects for ContentForm dropdowns
    const [status, setStatus] = useState({ message: '', type: '' });
    const [loadingSubjects, setLoadingSubjects] = useState(true); // Loading state for fetching subjects

    // --- Status Message Component & Helper ---
    const showStatus = (message, type) => {
        setStatus({ message, type });
        setTimeout(() => setStatus({ message: '', type: '' }), 5000);
    };

    const StatusBox = ({ message, type }) => {
        if (!message) return null;
        const baseClass = "p-4 rounded-lg text-sm mb-6 font-medium";
        const typeClass = type === 'success' ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800";
        return <div className={`${baseClass} ${typeClass}`}>{message}</div>;
    };

    // --- Data Fetching (Fetches all subjects for dropdowns) ---
    const fetchSubjects = async () => {
        setLoadingSubjects(true);
        try {
            // Fetch ALL subjects to populate the dropdowns in ContentForm
            const res = await axios.get(`${API_URL}/content/subjects`);
            setSubjects(res.data);
        } catch (error) {
            console.error("Failed to fetch subjects for dropdowns.", error);
            showStatus('Failed to load subjects for forms. Check console.', 'error');
        } finally {
            setLoadingSubjects(false);
        }
    };
    
    // Fetch subjects on initial load and whenever status changes (after a successful creation)
    useEffect(() => {
        fetchSubjects();
    }, [status.type]); // Reruns when a subject is created/added

    // --- Render Logic for Active Tab ---
    const renderForm = () => {
        if (loadingSubjects && activeTab !== 'manage_structure') {
            return <div className="text-center p-10 text-indigo-600">Loading subjects for forms...</div>;
        }

        if (activeTab === 'create_subject') {
            return (
                <SubjectForm 
                    showStatus={showStatus} 
                    // When a subject is created, we update the status to trigger a refetch of the list
                    onSubjectCreated={() => showStatus('Subject created! Refreshing list...', 'success')}
                />
            );
        }
        if (activeTab === 'add_content') {
            return (
                <ContentForm 
                    showStatus={showStatus} 
                    subjects={subjects} // Pass the list of fetched subjects for dropdowns
                />
            );
        }
        // ✅ NEW SECTION RENDER: Branch and Year management
        if (activeTab === 'manage_structure') { 
            return (
                <BranchYearManager 
                    showStatus={showStatus} 
                />
            );
        }

        return <div className="p-10 text-center text-gray-500">Select a management section.</div>;
    };

    return (
        <div className="py-8">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Admin Dashboard 🛠️</h1>
            <p className="text-lg text-indigo-600 mb-8">Welcome, {user?.username}.</p>

            <StatusBox message={status.message} type={status.type} />

            {/* Tab Navigation (Sections) */}
            <div className="border-b border-gray-200 mb-6">
                <nav className="-mb-px flex space-x-8">
                    {TABS.map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => {
                                setActiveTab(tab.key);
                                setStatus({ message: '', type: '' }); // Clear status on tab switch
                            }}
                            className={`
                                ${activeTab === tab.key
                                    ? 'border-indigo-500 text-indigo-600 font-semibold'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }
                                whitespace-nowrap py-3 px-1 border-b-2 text-lg transition-colors duration-200
                            `}
                        >
                            {tab.name}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Render Active Form */}
            <div className="bg-white p-8 rounded-xl shadow-2xl">
                {renderForm()}
            </div>
        </div>
    );
};

export default AdminDashboard;