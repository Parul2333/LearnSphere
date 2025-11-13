import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth';

const Signup = () => {
    const [formData, setFormData] = useState({ username: '', email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        
        try {
            // Sends data to the /api/auth/register endpoint
            // The backend defaults the user role to 'user'
            await axios.post(`${API_URL}/register`, formData);
            
            alert("Registration successful! Please log in.");
            navigate('/login');
        } catch (err) {
            // Handles errors (like duplicate email or backend 500 error)
            const message = err.response?.data?.message || 'Registration failed. Try a different email.';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center py-12">
            <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-2xl border border-gray-100">
                <h2 className="text-3xl font-bold text-gray-900 text-center mb-6">
                    Create LearnSphere Account
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Username Field */}
                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username</label>
                        <input 
                            type="text" 
                            id="username" 
                            onChange={handleChange} 
                            required 
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm" 
                        />
                    </div>
                    
                    {/* Email Field */}
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                        <input 
                            type="email" 
                            id="email" 
                            onChange={handleChange} 
                            required 
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm" 
                        />
                    </div>
                    
                    {/* Password Field */}
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                        <input 
                            type="password" 
                            id="password" 
                            onChange={handleChange} 
                            required 
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm" 
                        />
                    </div>

                    {error && (
                        <div className="p-3 text-sm text-red-700 bg-red-100 rounded-md">{error}</div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full flex justify-center py-2 px-4 rounded-md shadow-sm text-sm font-medium text-white 
                            ${loading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'} 
                            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150`}
                    >
                        {loading ? 'Registering...' : 'Sign Up'}
                    </button>
                </form>

                <p className="mt-4 text-center text-sm text-gray-600">
                    Already have an account? <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">Log In</Link>
                </p>
            </div>
        </div>
    );
};

export default Signup;