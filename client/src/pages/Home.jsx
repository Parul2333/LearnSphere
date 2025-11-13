import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

// ✅ CRITICAL FIX: Use the base API URL for PUBLIC content
const API_URL = 'http://localhost:5000/api/content'; 

const Home = () => {
    const [branches, setBranches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch dynamic branches from MongoDB Atlas
    useEffect(() => {
        const fetchBranches = async () => {
            try {
                // ✅ FIX: Hitting the public /api/content/branches endpoint
                const res = await axios.get(`${API_URL}/branches`); 
                setBranches(res.data);
            } catch (err) {
                console.error("Error fetching branches:", err);
                setError("Failed to load available branches. Check backend server and ensure /api/content/branches route is working.");
            } finally {
                setLoading(false);
            }
        };

        fetchBranches();
    }, []);

    if (loading) {
        return <div className="text-center p-12 text-xl text-indigo-600">Loading Academic Structure...</div>;
    }

    if (error) {
        return <div className="text-center p-12 text-xl text-red-600">{error}</div>;
    }

    if (branches.length === 0) {
        return <div className="text-center p-12 text-xl text-yellow-600">No academic branches have been configured by the admin yet.</div>;
    }

    return (
        <div className="py-12 px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-extrabold text-gray-900 text-center mb-10 tracking-tight">
                Welcome to LearnSphere 🎓
            </h1>
            <p className="text-center text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
                Select your **Branch** to view available academic years and subject content.
            </p>

            {/* Grid Container for Branch Cards (Now linked to YearSelection) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-4xl mx-auto">
                {branches.map((branch) => (
                    <Link
                        // Link navigates to the YearSelection page, passing the Branch ID.
                        to={`/branch/${branch._id}`} 
                        key={branch._id}
                        className="block transition-all duration-300 transform hover:scale-[1.03] hover:shadow-xl rounded-xl"
                    >
                        <div className="p-6 h-full rounded-xl shadow-lg bg-white border-l-4 border-indigo-500">
                            <h2 className="text-xl font-bold text-gray-800 mb-2">
                                {branch.name}
                            </h2>
                            <p className="text-sm text-gray-500 mt-2">
                                Years Available: **{branch.years.length}**
                            </p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default Home;