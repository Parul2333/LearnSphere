import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import SubjectCard from '../components/subject/SubjectCard.jsx'; 

// Base API URL for all public endpoints
const API_URL = 'http://localhost:5000/api'; 

const SubjectList = () => {
    // URL parameters: branchId and the display name of the year
    const { branchId, yearName } = useParams(); 
    
    const [allSubjects, setAllSubjects] = useState([]); // All subjects fetched from DB
    const [branchName, setBranchName] = useState(''); // To display the branch name
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // --- Data Fetching ---
    useEffect(() => {
        const fetchAllData = async () => {
            try {
                // 1. Fetch All Subjects (Public endpoint - OK)
                const subjectsRes = await axios.get(`${API_URL}/content/subjects`);
                setAllSubjects(subjectsRes.data);
                
                // 2. Fetch Branch Name for Display
                // ✅ CRITICAL FIX: Use the public /api/content/branches endpoint
                const branchesRes = await axios.get(`${API_URL}/content/branches`); 
                const currentBranch = branchesRes.data.find(b => b._id === branchId);
                
                if (currentBranch) {
                    setBranchName(currentBranch.name);
                } else {
                    setError("Branch structure not found.");
                }

            } catch (err) {
                console.error("Error fetching data:", err);
                setError("Failed to load curriculum data. Please ensure the public content route for branches is working.");
            } finally {
                setLoading(false);
            }
        };

        fetchAllData();
    }, [branchId]); // Reruns if the Branch ID in the URL changes

    // --- Filter Subjects based on URL parameters ---
    const subjectsForYear = useMemo(() => {
        if (!yearName) return [];
        return allSubjects.filter(subject => 
            // Filter by Branch ID (the database link) AND the Year Name
            subject.branch === branchId &&
            subject.year === yearName
        );
    }, [allSubjects, branchId, yearName]); // Depend on branchId and yearName from URL


    if (loading) {
        return <div className="text-center p-12 text-xl text-indigo-600">Loading subjects for {yearName}...</div>;
    }

    if (error) {
        return <div className="text-center p-12 text-xl text-red-600">{error}</div>;
    }

    return (
        <div className="py-8 px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-extrabold text-gray-800 mb-2 tracking-tight">
                {branchName} — {yearName}
            </h1>
            <p className="text-lg text-indigo-600 mb-6">
                Showing all subjects for the selected academic year.
            </p>
            
            {/* Subject List Display */}
            {subjectsForYear.length === 0 ? (
                <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-4 rounded-lg">
                    <p className="font-medium">No subjects found for {yearName}.</p>
                    <p className="text-sm mt-1">Please ensure subjects are created in the Admin Dashboard for this combination.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {subjectsForYear.map(subject => (
                        <SubjectCard 
                            key={subject._id} 
                            subject={subject} 
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default SubjectList;