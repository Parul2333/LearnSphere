import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

import { API_BASE_URL } from '../api/config.js';

const API_URL = `${API_BASE_URL}/content`;

export default function Explore() {
    const [branches, setBranches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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

    if (loading) return <div className="p-12 text-center text-indigo-600">Loading branches...</div>;
    if (error) return <div className="p-12 text-center text-red-600">{error}</div>;
    if (!branches.length) return <div className="p-12 text-center text-yellow-600">No branches configured yet.</div>;

    return (
        <div className="py-12 px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-center mb-6">Explore Branches</h1>
            <p className="text-center text-gray-600 mb-8 max-w-2xl mx-auto">Choose a branch to view available academic years and subjects.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
                {branches.map((b) => (
                    <Link to={`/branch/${b._id}`} key={b._id} className="block p-6 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition">
                        <h2 className="text-xl font-semibold">{b.name}</h2>
                        <p className="text-sm text-gray-500 mt-2">Years: {Array.isArray(b.years) ? b.years.length : 0}</p>
                    </Link>
                ))}
            </div>
        </div>
    );
}
