import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../api/config.js';

// Base API URL for public content structure
const API_URL = `${API_BASE_URL}/content`; 

const YearSelection = () => {
    const { branchId } = useParams();
    const [branchData, setBranchData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch the specific branch data to get its list of years
    useEffect(() => {
        const fetchBranchData = async () => {
            try {
                // Fetch ALL branches from the public endpoint
                const res = await axios.get(`${API_URL}/branches`);
                // Find the branch matching the ID from the URL
                const currentBranch = res.data.find(b => b._id === branchId);

                if (!currentBranch) {
                    setError("Branch not found or structure invalid.");
                    return;
                }
                setBranchData(currentBranch);
            } catch (err) {
                console.error("Error fetching branch data:", err);
                setError("Failed to load years. Please check API connection.");
            } finally {
                setLoading(false);
            }
        };

        fetchBranchData();
    }, [branchId]);

    if (loading) {
        return <div className="text-center p-12 text-xl text-indigo-600">Loading branch details...</div>;
    }

    if (error) {
        return <div className="text-center p-12 text-xl text-red-600">{error}</div>;
    }

    const availableYears = branchData.years || [];

    return (
        <div className="py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto mb-6">
                <button onClick={() => window.history.back()} className="text-indigo-600 hover:underline mb-4">← Back</button>
                <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">{branchData.name} Curriculum</h1>
                <p className="text-gray-600 dark:text-gray-300">Select your academic year to view subjects and content.</p>
            </div>

            {/* Grid Container for Year Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
                {availableYears.map((year) => (
                    <Link
                        to={`/branch/${branchId}/year/${year}`} 
                        key={String(year)}
                        className="block p-6 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition"
                    >
                        <div className="flex items-center justify-center h-24">
                            <div className="text-2xl font-semibold">{year}</div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default YearSelection;