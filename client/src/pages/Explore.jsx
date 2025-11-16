import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

import { API_BASE_URL } from '../api/config.js';
import { SessionStorage } from '../utils/storageManager.js';

const API_URL = `${API_BASE_URL}/content`;

export default function Explore() {
    const [branches, setBranches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedBranches, setExpandedBranches] = useState(() => {
        // 🔥 Load expanded branches from sessionStorage
        const uiState = SessionStorage.getTempUIState();
        return uiState?.expandedBranches || {};
    });

    useEffect(() => {
        const fetchBranches = async () => {
            try {
                const res = await axios.get(`${API_URL}/branches`);
                setBranches(res.data || []);
            } catch (err) {
                console.error('Failed to load branches', err);
                setError('Failed to load branches. Ensure the backend is running.');
            } finally {
                setLoading(false);
            }
        };
        fetchBranches();
    }, []);

    // 🔥 Save expanded state to sessionStorage
    useEffect(() => {
        const uiState = SessionStorage.getTempUIState();
        uiState.expandedBranches = expandedBranches;
        SessionStorage.setTempUIState(uiState);
    }, [expandedBranches]);

    const toggleExpanded = (branchId) => {
        setExpandedBranches(prev => ({
            ...prev,
            [branchId]: !prev[branchId]
        }));
    };

    if (loading) return <div className="p-12 text-center text-indigo-600">Loading branches...</div>;
    if (error) return <div className="p-12 text-center text-red-600">{error}</div>;
    if (!branches.length) return <div className="p-12 text-center text-yellow-600">No branches configured yet.</div>;

    return (
        <div className="py-12 px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-center mb-6">Explore Branches</h1>
            <p className="text-center text-gray-600 mb-8 max-w-2xl mx-auto">Choose a branch to view available academic years and subjects.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
                {branches.map((b) => (
                    <div key={b._id} className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition">
                        <Link to={`/branch/${b._id}`} className="block p-6">
                            <h2 className="text-xl font-semibold">{b.name}</h2>
                            <p className="text-sm text-gray-500 mt-2">Years: {Array.isArray(b.years) ? b.years.length : 0}</p>
                        </Link>
                        <button
                            onClick={() => toggleExpanded(b._id)}
                            className="w-full px-4 py-2 text-sm bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-800 transition"
                        >
                            {expandedBranches[b._id] ? '▼ Hide Details' : '▶ Show Details'}
                        </button>
                        {expandedBranches[b._id] && (
                            <div className="px-6 pb-4 border-t border-gray-200 dark:border-gray-700">
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                                    {b.description || 'No description available'}
                                </p>
                                {Array.isArray(b.years) && b.years.length > 0 && (
                                    <div className="mt-3">
                                        <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">Available Years:</p>
                                        <div className="flex flex-wrap gap-2 mt-1">
                                            {b.years.map(year => (
                                                <span key={year} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs rounded">
                                                    {year}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
