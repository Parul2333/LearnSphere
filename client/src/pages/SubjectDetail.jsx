import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import ContentViewer from '../components/subject/ContentViewer.jsx'; 
// Assuming a SearchBar component will be created
const SearchBar = ({ onSearch }) => (
    <div className="mb-8">
        <input
            type="search"
            placeholder="Search note content..."
            onChange={(e) => onSearch(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
        />
    </div>
);

const API_URL = 'http://localhost:5000/api/content';

const SubjectDetail = () => {
    const { id } = useParams();
    
    const [subject, setSubject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeSection, setActiveSection] = useState('notes'); 
    const [searchTerm, setSearchTerm] = useState(''); // State for search input

    useEffect(() => {
        const fetchContent = async () => {
            try {
                const response = await axios.get(`${API_URL}/subject/${id}`);
                setSubject(response.data);
            } catch (err) {
                console.error("Error fetching subject content:", err);
                setError("Failed to load content.");
            } finally {
                setLoading(false);
            }
        };
        fetchContent();
    }, [id]);

    // Function to group content items by category
    const groupedContent = useMemo(() => {
        if (!subject) return {};
        return subject.content.reduce((acc, item) => {
            const categoryKey = item.category;
            if (!acc[categoryKey]) {
                acc[categoryKey] = [];
            }
            acc[categoryKey].push(item);
            return acc;
        }, {});
    }, [subject]);

    const sections = [
        { key: 'syllabus', title: 'Syllabus' },
        { key: 'notes', title: 'Notes' },
        { key: 'reference_video', title: 'Reference Videos' },
        { key: 'general_info', title: 'General Info' },
    ];

    // Filter content based on active section and search term
    const currentContent = useMemo(() => {
        const content = groupedContent[activeSection] || [];
        if (!searchTerm) return content;
        
        const lowerCaseSearch = searchTerm.toLowerCase();
        return content.filter(item => 
            item.title.toLowerCase().includes(lowerCaseSearch) ||
            item.link.toLowerCase().includes(lowerCaseSearch)
        );
    }, [groupedContent, activeSection, searchTerm]);


    if (loading) {
        return <div className="text-center p-16 text-xl text-indigo-600">Loading Subject Resources...</div>;
    }

    if (error) {
        return <div className="text-center p-16 text-xl text-red-600">{error}</div>;
    }

    if (!subject) {
        return <div className="text-center p-16 text-xl text-gray-500">Subject data not available.</div>;
    }

    return (
        <div className="py-8">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-2">{subject.name.toUpperCase()}</h1>
            <p className="text-lg text-gray-600 mb-6">
                Connecting computers to share data and resources. 
                {/* Placeholder description; Branch/Year can be added here */}
            </p>

            {/* Search Bar */}
            <SearchBar onSearch={setSearchTerm} />

            {/* Tabbed Navigation for Sections */}
            <div className="border-b border-gray-200 mb-6">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    {sections.map(section => (
                        <button
                            key={section.key}
                            onClick={() => setActiveSection(section.key)}
                            className={`
                                ${activeSection === section.key
                                    ? 'border-indigo-500 text-indigo-600 font-semibold'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }
                                whitespace-nowrap py-3 px-1 border-b-2 text-base transition-colors duration-200 flex items-center
                            `}
                        >
                            {/* Adding Icons next to tab names */}
                            {section.title} {section.key === 'reference_video' && '▶️'} {section.key === 'notes' && '📝'} {section.key === 'syllabus' && '📜'} {section.key === 'general_info' && 'ⓘ'}
                        </button>
                    ))}
                </nav>
            </div>
            
            {/* Content Display Area */}
            <div className="bg-white p-0 rounded-lg shadow-lg"> {/* Removed padding here to make list items full width */}
                
                {/* List Header (Visible Section Title) */}
                <h2 className="text-2xl font-bold text-gray-800 p-6">
                    {sections.find(s => s.key === activeSection).title} {activeSection === 'reference_video' ? '▶️' : '📝'}
                </h2>

                {currentContent.length > 0 ? (
                    <div className="divide-y divide-gray-100"> {/* Use divide-y instead of border-b */}
                        {currentContent.map((item) => (
                            // ✅ CRITICAL FIX: The list item layout
                            <div 
                                key={item._id} 
                                className="flex justify-between items-center px-6 py-4 transition-colors hover:bg-gray-50"
                            >
                                
                                {/* Item Icon & Text Content */}
                                <div className="flex items-start space-x-4 flex-grow min-w-0">
                                    <span className="text-2xl pt-1">
                                        {/* Dynamic Icon based on category */}
                                        {item.category === 'reference_video' ? '📺' : '📄'}
                                    </span>
                                    <div className="flex-grow min-w-0">
                                        {/* Title (Lec-5, Lecture-1, etc.) */}
                                        <h3 className="text-base font-semibold text-gray-900 truncate">
                                            {item.title}
                                        </h3>
                                        {/* Description/Link (Full text of the link) */}
                                        <p className="text-sm text-gray-500 truncate mt-0.5">
                                            {item.link}
                                        </p>
                                    </div>
                                </div>
                                
                                {/* Button (Fixed Size) */}
                                <div className="ml-4 flex-shrink-0">
                                    {/* ContentViewer is now a single button */}
                                    <ContentViewer contentItem={item} /> 
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-gray-50 p-6 rounded-lg text-gray-600">
                        <p>No content has been added to the **{sections.find(s => s.key === activeSection).title}** section yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SubjectDetail;