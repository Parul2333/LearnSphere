// client/src/components/common/SearchBar.jsx

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

import { API_BASE_URL } from '../../api/config.js';

const API_URL = `${API_BASE_URL}/search`;

const SearchBar = () => {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const suggestionsRef = useRef(null);
    const navigate = useNavigate();

    // Fetch suggestions as user types
    useEffect(() => {
        if (query.length < 1) {
            setSuggestions([]);
            return;
        }

        const timer = setTimeout(async () => {
            try {
                const res = await axios.get(`${API_URL}/suggestions`, { params: { q: query } });
                setSuggestions(res.data);
            } catch (error) {
                console.error('Suggestions error:', error);
            }
        }, 300); // Debounce

        return () => clearTimeout(timer);
    }, [query]);

    // Close suggestions when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (suggestionsRef.current && !suggestionsRef.current.contains(e.target)) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSearch = async (searchQuery) => {
        if (searchQuery.trim().length < 2) {
            alert('Please enter at least 2 characters.');
            return;
        }

        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/global`, {
                params: { q: searchQuery, type: 'all', limit: 50 },
            });
            setResults(res.data);
            setShowSuggestions(false);
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSuggestionClick = (suggestion) => {
        setQuery(suggestion.text);
        handleSearch(suggestion.text);
    };

    const handleSubjectClick = (subjectId) => {
        navigate(`/subject/${subjectId}`);
        setResults(null);
        setQuery('');
    };

    return (
        <div className="w-full">
            {/* Search Input Section */}
            <div className="relative mb-6" ref={suggestionsRef}>
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            setShowSuggestions(true);
                        }}
                        onFocus={() => setShowSuggestions(true)}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter') handleSearch(query);
                        }}
                        placeholder="Search subjects, content, branches..."
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <button
                        onClick={() => handleSearch(query)}
                        disabled={loading}
                        className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400 transition-colors"
                    >
                        {loading ? '🔍 Searching...' : 'Search'}
                    </button>
                </div>

                {/* Suggestions Dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                        <div className="max-h-64 overflow-y-auto">
                            {suggestions.map((suggestion, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleSuggestionClick(suggestion)}
                                    className="w-full text-left px-4 py-2 hover:bg-gray-100 border-b last:border-b-0 transition-colors"
                                >
                                    <span className="text-sm font-medium text-indigo-600">{suggestion.type}</span>
                                    <p className="text-gray-900">{suggestion.text}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Search Results Section */}
            {results && (
                <div className="space-y-6">
                    {/* Branches Results */}
                    {results.branches.length > 0 && (
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-3">📚 Branches</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {results.branches.map((branch) => (
                                    <div
                                        key={branch._id}
                                        className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                                        onClick={() => navigate(`/branch/${branch._id}`)}
                                    >
                                        <h4 className="font-semibold text-indigo-600">{branch.name}</h4>
                                        <p className="text-sm text-gray-600">{branch.years.length} years</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Subjects Results */}
                    {results.subjects.length > 0 && (
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-3">📖 Subjects</h3>
                            <div className="space-y-2">
                                {results.subjects.map((subject) => (
                                    <div
                                        key={subject._id}
                                        className="p-4 border rounded-lg hover:bg-indigo-50 cursor-pointer transition-colors"
                                        onClick={() => handleSubjectClick(subject._id)}
                                    >
                                        <h4 className="font-semibold text-gray-900">{subject.name}</h4>
                                        <p className="text-sm text-gray-600">{subject.year}</p>
                                        <div className="mt-2 bg-gray-200 h-2 rounded-full">
                                            <div
                                                className="bg-indigo-500 h-2 rounded-full"
                                                style={{ width: `${subject.completionPercentage}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Content Results */}
                    {results.content.length > 0 && (
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-3">📄 Content</h3>
                            <div className="space-y-2">
                                {results.content.map((content) => (
                                    <div
                                        key={content._id}
                                        className="p-4 border rounded-lg hover:bg-blue-50 cursor-pointer transition-colors"
                                        onClick={() => handleSubjectClick(content.subject._id)}
                                    >
                                        <h4 className="font-semibold text-gray-900">{content.title}</h4>
                                        <p className="text-sm text-gray-600">
                                            {content.category.replace('_', ' ').toUpperCase()} • {content.subject.name}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* No Results */}
                    {results.subjects.length === 0 &&
                        results.content.length === 0 &&
                        results.branches.length === 0 && (
                            <div className="p-6 text-center text-gray-600">
                                <p>No results found for "{query}"</p>
                            </div>
                        )}
                </div>
            )}
        </div>
    );
};

export default SearchBar;
