// client/src/pages/Admin/Analytics.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext.jsx';

import { API_BASE_URL } from '../../api/config.js';

const API_URL = `${API_BASE_URL}/admin/analytics`;

const Analytics = () => {
    const { token } = useAuth();
    const [analytics, setAnalytics] = useState(null);
    const [engagement, setEngagement] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            const [analyticsRes, engagementRes] = await Promise.all([
                axios.get(API_URL, {
                    headers: { Authorization: `Bearer ${token}` },
                }),
                axios.get(`${API_URL}/engagement`, {
                    headers: { Authorization: `Bearer ${token}` },
                }),
            ]);

            setAnalytics(analyticsRes.data);
            setEngagement(engagementRes.data);
        } catch (err) {
            console.error('Error fetching analytics:', err);
            setError('Failed to load analytics data.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="p-10 text-center text-indigo-600">Loading analytics...</div>;
    }

    if (error) {
        return <div className="p-10 text-center text-red-600">{error}</div>;
    }

    if (!analytics) {
        return <div className="p-10 text-center text-gray-600">No analytics data available.</div>;
    }

    const { summary, contentDistribution, completionStats, subjectsByBranch, topSubjects } = analytics;

    return (
        <div className="py-8 space-y-8 dark:bg-gray-900 dark:text-white">
            <div>
                <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-2">Analytics Dashboard 📊</h1>
                <p className="text-lg text-gray-600 dark:text-gray-400">Platform statistics and insights.</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Total Branches */}
                <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg border-l-4 border-blue-500">
                    <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium">Total Branches</h3>
                    <p className="text-4xl font-bold text-blue-600 dark:text-blue-400 mt-2">{summary.totalBranches}</p>
                </div>

                {/* Total Subjects */}
                <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg border-l-4 border-green-500">
                    <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium">Total Subjects</h3>
                    <p className="text-4xl font-bold text-green-600 dark:text-green-400 mt-2">{summary.totalSubjects}</p>
                </div>

                {/* Total Content */}
                <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg border-l-4 border-purple-500">
                    <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium">Content Items</h3>
                    <p className="text-4xl font-bold text-purple-600 dark:text-purple-400 mt-2">{summary.totalContent}</p>
                </div>

                {/* Total Users */}
                <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg border-l-4 border-orange-500">
                    <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium">Users</h3>
                    <p className="text-4xl font-bold text-orange-600 dark:text-orange-400 mt-2">{summary.totalUsers}</p>
                </div>

                {/* Admins */}
                <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg border-l-4 border-red-500">
                    <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium">Admins</h3>
                    <p className="text-4xl font-bold text-red-600 dark:text-red-400 mt-2">{summary.totalAdmins}</p>
                </div>

                {/* Website Visits */}
                <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg border-l-4 border-indigo-500">
                    <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium">Website Visits</h3>
                    <p className="text-4xl font-bold text-indigo-600 dark:text-indigo-400 mt-2">
                        {summary.websiteVisits.toLocaleString()}
                    </p>
                </div>
            </div>

            {/* Content Distribution */}
            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">📄 Content Distribution</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(contentDistribution).map(([category, count]) => (
                        <div key={category} className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{category.replace('_', ' ').toUpperCase()}</p>
                            <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">{count}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Completion Statistics */}
            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">📊 Completion Statistics</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Average Completion</p>
                        <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                            {completionStats.avgCompletion.toFixed(1)}%
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Highest Completion</p>
                        <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-1">
                            {completionStats.maxCompletion}%
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Lowest Completion</p>
                        <p className="text-3xl font-bold text-red-600 dark:text-red-400 mt-1">
                            {completionStats.minCompletion}%
                        </p>
                    </div>
                </div>
            </div>

            {/* Subjects by Branch */}
            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">🌳 Subjects by Branch</h2>
                <div className="space-y-3">
                    {subjectsByBranch.map((item) => (
                        <div key={item.branchName} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <span className="font-medium text-gray-900 dark:text-white">{item.branchName}</span>
                            <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900 px-3 py-1 rounded">
                                {item.subjectCount} subjects
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Top Subjects */}
            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">⭐ Top Completed Subjects</h2>
                <div className="space-y-4">
                    {topSubjects.map((subject, idx) => (
                        <div key={idx} className="p-4 border-l-4 border-green-500 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <div className="flex items-start justify-between mb-2">
                                <div>
                                    <h4 className="font-semibold text-gray-900 dark:text-white">{subject.name}</h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">{subject.branch} • {subject.year}</p>
                                </div>
                                <span className="text-sm font-bold text-green-600 dark:text-green-400">{subject.completion}%</span>
                            </div>
                            <div className="w-full bg-gray-300 dark:bg-gray-600 h-2 rounded-full">
                                <div
                                    className="bg-green-500 h-2 rounded-full"
                                    style={{ width: `${subject.completion}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Analytics;
