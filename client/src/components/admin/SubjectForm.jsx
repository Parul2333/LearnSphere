// client/src/components/admin/SubjectForm.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext.jsx';

const API_URL = 'http://localhost:5000/api/admin';

const SubjectForm = ({ showStatus, onSubjectCreated }) => {
    const { token } = useAuth();
    const [branches, setBranches] = useState([]); // Stores the fetched list of branches from DB
    const [loadingBranches, setLoadingBranches] = useState(true);

    const [data, setData] = useState({ name: '', year: '', branchId: '' }); // Uses branchId now

    // --- Fetch Branches from MongoDB ---
    useEffect(() => {
        const fetchBranches = async () => {
            setLoadingBranches(true);
            try {
                const res = await axios.get(`${API_URL}/branches`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const loadedBranches = res.data;
                setBranches(loadedBranches);

                // Set initial form state based on fetched data
                if (loadedBranches.length > 0) {
                    const initialBranch = loadedBranches[0];
                    setData(prev => ({
                        ...prev,
                        branchId: initialBranch._id, // Use ID
                        year: initialBranch.years[0] || '' // Use first available year
                    }));
                }
            } catch (error) {
                console.error("Error fetching branches:", error);
                showStatus('Failed to load branches for dropdowns.', 'error');
            } finally {
                setLoadingBranches(false);
            }
        };
        fetchBranches();
    }, [token]);

    // --- Dynamic Year Update Logic ---
    const selectedBranch = branches.find(b => b._id === data.branchId);
    const availableYears = selectedBranch ? selectedBranch.years : [];

    // Reset year selection if branch changes or initial load occurs
    useEffect(() => {
        if (availableYears.length > 0 && !availableYears.includes(data.year)) {
             setData(prev => ({ ...prev, year: availableYears[0] }));
        }
    }, [data.branchId, availableYears]);


    // --- Subject Creation Handler ---
    const handleCreateSubject = async (e) => {
        e.preventDefault();
        
        if (!data.branchId || !data.year) {
             showStatus('Please ensure a Branch and Year are selected.', 'error');
             return;
        }

        try {
            // Note: Data sent includes branchId, not the branch name
            await axios.post(`${API_URL}/subjects`, data, { 
                headers: { Authorization: `Bearer ${token}` }
            });
            showStatus(`Subject '${data.name}' created successfully!`, 'success');
            onSubjectCreated(); // Trigger dashboard refresh
            
            // Reset name field but keep current branch/year selection
            setData(prev => ({ ...prev, name: '' })); 

        } catch (error) {
            const msg = error.response?.data?.message || 'Error creating subject.';
            showStatus(msg, 'error');
        }
    };

    if (loadingBranches) {
        return <div className="p-4 text-center text-indigo-600">Loading academic structure...</div>;
    }

    if (branches.length === 0) {
        return (
            <div className="p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800">
                <p>⚠️ No academic branches defined.</p>
                <p className="text-sm mt-1">Please go to the **Manage Structure** tab to define branches and years first.</p>
            </div>
        );
        }

    return (
        <div className="max-w-xl">
            <h3 className="text-xl font-semibold mb-4">Create New Subject</h3>
            <form onSubmit={handleCreateSubject} className="space-y-4">
                
                {/* Subject Name */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Subject Name</label>
                    <input
                        type="text"
                        value={data.name}
                        onChange={(e) => setData({...data, name: e.target.value})}
                        required
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                    />
                </div>

                {/* Branch Dropdown (Uses Branch ID for value) */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Branch</label>
                    <select
                        value={data.branchId}
                        onChange={(e) => setData({...data, branchId: e.target.value})}
                        required
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                    >
                        {branches.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                    </select>
                </div>
                
                {/* Year Dropdown */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Year</label>
                    <select
                        value={data.year}
                        onChange={(e) => setData({...data, year: e.target.value})}
                        required
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                    >
                        {/* Map years based on the currently selected branch */}
                        {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                </div>

                <button type="submit" className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors">
                    Create Subject
                </button>
            </form>
        </div>
    );
};

export default SubjectForm;