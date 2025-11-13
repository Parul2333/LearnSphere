import React from 'react';
import { Link } from 'react-router-dom';

const SubjectCard = ({ subject }) => {
    // Ensure percentage is capped between 0 and 100
    const percentage = Math.max(0, Math.min(100, subject.completionPercentage || 0));

    return (
        <Link 
            to={`/subject/${subject._id}`} 
            className="block h-full"
        >
            <div 
                className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 
                           transform hover:translate-y-[-2px] border-l-4 border-indigo-500 h-full"
            >
                {/* ✅ DISPLAY ONLY THE NAME, YEAR, AND BRANCH */}
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {subject.name} 
                </h3>
                <p className="text-sm text-indigo-600 mb-4">
                    {subject.year}
                </p>

                {/* Progress Bar Section (Visible elements) */}
                <div className="mt-4">
                    <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Content Completion</span>
                        <span className="font-medium text-indigo-700">{percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                            className="bg-indigo-500 h-2.5 rounded-full transition-all duration-1000 ease-out"
                            style={{ width: `${percentage}%` }}
                        ></div>
                    </div>
                </div>

                <div className="mt-4 text-sm text-right text-indigo-500 font-medium">
                    View Content →
                </div>
            </div>
        </Link>
    );
};

export default SubjectCard;