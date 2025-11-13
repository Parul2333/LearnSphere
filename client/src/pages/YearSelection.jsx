import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

// Base API URL for public content structure
const API_URL = 'http://localhost:5000/api/content'; 

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
            <h1 className="text-4xl font-extrabold text-gray-900 text-center mb-4 tracking-tight">
                {branchData.name} Curriculum
            </h1>
            <p className="text-center text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
                Select your **Academic Year** to view subjects.
            </p>

            {/* Grid Container for Year Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-4xl mx-auto">
                {availableYears.map((year, index) => (
                    <Link
                        // Link navigates to the SubjectList page, passing BOTH the Branch ID and Year Name
                        to={`/branch/${branchId}/year/${year}`} 
                        key={year}
                        className="block transition-all duration-300 transform hover:scale-[1.03] hover:shadow-xl rounded-xl"
                    >
                        <div 
                            className={`p-8 h-full rounded-xl shadow-lg bg-white border-l-4 border-indigo-500 hover:bg-gray-50`}
                        >
                            <div className="text-5xl mb-4 text-center">
                                {/* Display simple sequential number or icon */}
                                {index + 1}
                            </div>
                            <h2 className="text-xl font-bold text-gray-800 text-center mt-4">
                                {year}
                            </h2>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default YearSelection;