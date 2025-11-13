import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext.jsx';

const API_URL = 'http://localhost:5000/api/admin';

const BranchYearManager = ({ showStatus }) => {
    const { token } = useAuth();
    const [structure, setStructure] = useState([]); // Array of { _id, name, years } objects from DB
    const [loading, setLoading] = useState(true);
    
    const [newBranchName, setNewBranchName] = useState('');
    const [yearsInput, setYearsInput] = useState('First Year, Second Year, Third Year, Fourth Year');
    const [selectedBranchId, setSelectedBranchId] = useState(''); // Stores the branch ID for deletion

    // --- Data Fetching: Load Structure from MongoDB ---
    const fetchStructure = async () => {
        setLoading(true);
        try {
            // GET request to fetch all branches
            const res = await axios.get(`${API_URL}/branches`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStructure(res.data);
            showStatus(`Loaded ${res.data.length} branches from database.`, 'info');
        } catch (error) {
            console.error("Error fetching structure:", error);
            showStatus('Failed to load structure from database.', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStructure();
    }, []); // Run only on component mount

    // --- Add Branch Handler: Sends data to MongoDB ---
    const handleAddBranch = async (e) => {
        e.preventDefault();
        const branchName = newBranchName.trim();
        // Convert comma-separated string to an array of trimmed strings
        const yearsArray = yearsInput.split(',').map(y => y.trim()).filter(y => y);

        if (!branchName || yearsArray.length === 0) {
            showStatus('Please enter a branch name and years.', 'error');
            return;
        }

        try {
            // POST request to create new branch in MongoDB
            await axios.post(`${API_URL}/branches`, { name: branchName, years: yearsArray }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            showStatus(`Branch '${branchName}' added successfully!`, 'success');
            setNewBranchName('');
            setYearsInput('First Year, Second Year, Third Year, Fourth Year');
            fetchStructure(); // Refresh list immediately
        } catch (error) {
            const msg = error.response?.data?.message || 'Error adding branch.';
            showStatus(msg, 'error');
        }
    };

    // --- Delete Branch Handler: Triggers Cascade Delete in Backend ---
    const handleDeleteBranch = async () => {
        if (!selectedBranchId) {
            showStatus('Please select a branch to delete.', 'error');
            return;
        }
        
        const selectedBranch = structure.find(b => b._id === selectedBranchId);
        
        const confirmation = window.confirm(`Are you sure you want to delete the branch: ${selectedBranch.name}? This will CASCADE DELETE all related subjects and content!`);
        
        if (confirmation) {
            try {
                // DELETE request to trigger cascade delete logic in the controller
                const res = await axios.delete(`${API_URL}/branches/${selectedBranchId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                showStatus(res.data.message, 'success'); // Shows the cascade success message
                setSelectedBranchId('');
                fetchStructure(); // Refresh list
            } catch (error) {
                const msg = error.response?.data?.message || 'Error deleting branch.';
                showStatus(msg, 'error');
            }
        }
    };

    if (loading) {
        return <div className="text-center p-6 text-indigo-600">Loading structure from database...</div>;
    }

    return (
        <div className="space-y-10">
            <h3 className="text-2xl font-semibold text-gray-800">Manage Academic Structure</h3>
            
            {/* Display Current Structure */}
            <div className="border p-4 rounded-lg bg-gray-50">
                <h4 className="text-lg font-medium mb-3">Current Branches ({structure.length}):</h4>
                <div className="space-y-3">
                    {structure.map(branch => (
                        <div key={branch._id} className="text-sm border-b pb-2">
                            <span className="font-semibold text-indigo-700">{branch.name}</span>: 
                            <span className="ml-2 text-gray-600">{branch.years.join(', ')}</span>
                            {/* Display ID for debugging/reference */}
                            <span className="ml-4 text-xs text-gray-400">ID: {branch._id}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* 1. Add New Branch Form (POST) */}
            <div className="p-6 border rounded-xl shadow-inner border-indigo-200">
                <h4 className="text-xl font-medium mb-4">Add New Branch and Years</h4>
                <form onSubmit={handleAddBranch} className="space-y-4">
                    
                    {/* Branch Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Branch Name</label>
                        <input
                            type="text"
                            value={newBranchName}
                            onChange={(e) => setNewBranchName(e.target.value)}
                            required
                            className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm"
                        />
                    </div>

                    {/* Years Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Years (Comma Separated)</label>
                        <textarea
                            value={yearsInput}
                            onChange={(e) => setYearsInput(e.target.value)}
                            required
                            rows="2"
                            className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm"
                        />
                    </div>

                    <button type="submit" className="w-full py-2 px-4 rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors">
                        Add Branch Structure
                    </button>
                </form>
            </div>

            {/* 2. Delete Existing Branch (DELETE) */}
            <div className="p-6 border border-red-200 rounded-xl">
                <h4 className="text-xl font-medium mb-4 text-red-700">Delete Existing Branch</h4>
                <div className="space-y-4">
                    <select
                        value={selectedBranchId}
                        onChange={(e) => setSelectedBranchId(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm"
                    >
                        <option value="">-- Select Branch to Delete --</option>
                        {structure.map(branch => (
                            <option key={branch._id} value={branch._id}>{branch.name}</option>
                        ))}
                    </select>

                    <button 
                        onClick={handleDeleteBranch} 
                        disabled={!selectedBranchId}
                        className="w-full py-2 px-4 rounded-md text-sm font-medium text-white bg-red-600 disabled:bg-red-300 hover:bg-red-700 transition-colors"
                    >
                        Delete Selected Branch and Content
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BranchYearManager;