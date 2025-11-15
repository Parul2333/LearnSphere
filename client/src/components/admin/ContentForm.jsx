import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext.jsx';

import { API_BASE_URL } from '../../api/config.js';

const API_URL = `${API_BASE_URL}/admin`;
const CATEGORIES = ['syllabus', 'reference_video', 'notes', 'general_info'];

const ContentForm = ({ showStatus, subjects }) => { // Subjects list is passed from Dashboard.jsx
    const { token } = useAuth();
    const [branches, setBranches] = useState([]); // Stores fetched branches
    const [loadingBranches, setLoadingBranches] = useState(true);

    const [selectedBranchId, setSelectedBranchId] = useState('');
    const [selectedYear, setSelectedYear] = useState('');

    const [contentData, setContentData] = useState({ 
        subjectId: '',
        title: '',
        category: CATEGORIES[0],
        link: '' 
    });

    // --- Fetch Branches from MongoDB ---
    useEffect(() => {
        const fetchBranches = async () => {
            setLoadingBranches(true);
            try {
                // Fetch the list of branches and their years using JWT
                const res = await axios.get(`${API_URL}/branches`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const loadedBranches = res.data;
                setBranches(loadedBranches);

                // Set initial filters based on the first loaded branch
                if (loadedBranches.length > 0) {
                    setSelectedBranchId(loadedBranches[0]._id);
                    setSelectedYear(loadedBranches[0].years[0] || '');
                }
            } catch (error) {
                console.error("Error fetching branches for content form:", error);
                showStatus('Failed to load branches for dropdowns. Check authentication.', 'error');
            } finally {
                setLoadingBranches(false);
            }
        };
        fetchBranches();
    }, [token, showStatus]);

    // Derived State: Available years for the selected branch
    const availableYears = branches.find(b => b._id === selectedBranchId)?.years || [];

    // Derived State: Filter subjects based on selected criteria (Branch ID and Year string)
    const availableSubjects = useMemo(() => {
        return subjects.filter(sub => 
            // Filter by Branch ID (the database link) AND Year string
            sub.branch === selectedBranchId && 
            sub.year === selectedYear
        );
    }, [subjects, selectedBranchId, selectedYear]);
    
    // Reset subject selection if filters change
    useEffect(() => {
        // Automatically select the first available subject, or none
        setContentData(prev => ({ ...prev, subjectId: availableSubjects[0]?._id || '' }));
    }, [availableSubjects]);


    const handleAddContent = async (e) => {
        e.preventDefault();
        if (!contentData.subjectId) {
            showStatus('Please select a subject.', 'error');
            return;
        }
        try {
            await axios.post(`${API_URL}/content`, contentData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            showStatus(`Content '${contentData.title}' added successfully!`, 'success');
            setContentData(prev => ({ 
                ...prev, 
                title: '', 
                link: '' 
            })); // Clear title/link fields
        } catch (error) {
            const msg = error.response?.data?.message || 'Error adding content.';
            showStatus(msg, 'error');
        }
    };

    if (loadingBranches) {
        return <div className="p-4 text-center text-indigo-600">Loading structure for content form...</div>;
    }
    if (branches.length === 0) {
        return (
            <div className="p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800">
                <p>⚠️ No academic branches defined.</p>
                <p className="text-sm mt-1">Please use the **Manage Structure** tab to define branches first.</p>
            </div>
        );
    }

    return (
        <div className="max-w-xl">
            <h3 className="text-xl font-semibold mb-4">Add Content Link</h3>
            <form onSubmit={handleAddContent} className="space-y-4">
                
                {/* 1. Branch Selection */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">1. Select Branch</label>
                    <select
                        value={selectedBranchId}
                        onChange={(e) => setSelectedBranchId(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                    >
                        {branches.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                    </select>
                </div>

                {/* 2. Year Selection */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">2. Select Year</label>
                    <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                    >
                        {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                </div>
                
                {/* 3. Subject Dropdown (Filtered by Branch ID and Year) */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">3. Select Subject</label>
                    <select
                        value={contentData.subjectId}
                        onChange={(e) => setContentData({...contentData, subjectId: e.target.value})}
                        required
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                    >
                        <option value="">-- Select Subject --</option>
                        {availableSubjects.map(sub => (
                            <option key={sub._id} value={sub._id}>
                                {sub.name}
                            </option>
                        ))}
                    </select>
                    {availableSubjects.length === 0 && (
                        <p className="text-xs text-red-500 mt-1">No subjects found for this selection.</p>
                    )}
                </div>

                {/* 4. Category Selection */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">4. Select Content Type</label>
                    <select
                        value={contentData.category}
                        onChange={(e) => setContentData({...contentData, category: e.target.value})}
                        required
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                    >
                        {CATEGORIES.map(c => <option key={c} value={c}>{c.replace('_', ' ').toUpperCase()}</option>)}
                    </select>
                </div>
                
                {/* 5. Title */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">5. Title</label>
                    <input
                        type="text"
                        value={contentData.title}
                        onChange={(e) => setContentData({...contentData, title: e.target.value})}
                        required
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                    />
                </div>

                {/* 6. Link Field */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">6. Google Drive/Video Link</label>
                    <input
                        type="url"
                        value={contentData.link}
                        onChange={(e) => setContentData({...contentData, link: e.target.value})}
                        required
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                    />
                </div>

                <button type="submit" className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 transition-colors">
                    Add Content
                </button>
            </form>
        </div>
    );
};

export default ContentForm;