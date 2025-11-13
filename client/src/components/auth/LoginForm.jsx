import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';

const LoginForm = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false); // 💡 NEW: State for "Remember Me"
    const [error, setError] = useState(null);
    
    const { login, loading } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        
        try {
            // 💡 CRITICAL: Pass rememberMe flag to the login function
            const user = await login(email, password, rememberMe); 
            
            // Redirect based on role after successful login
            if (user.role === 'admin') {
                navigate('/admin/dashboard');
            } else {
                navigate('/');
            }
        } catch (err) {
            // This catches security/rate limiting errors (403/401) and general login failure
            const message = err.response?.data?.message || 'Login failed. Please check credentials.';
            setError(message);
        }
    };

    return (
        <div className="flex justify-center items-center py-12">
            <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-2xl border border-gray-100">
                <h2 className="text-3xl font-bold text-gray-900 text-center mb-6">
                    Sign In to LearnSphere
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Email Field */}
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
                        />
                    </div>
                    
                    {/* Password Field */}
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
                        />
                    </div>

                    {/* Remember Me Checkbox (NEW UI Element) */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <input
                                id="remember-me"
                                name="remember-me"
                                type="checkbox"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                            />
                            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                                Remember me (90 days)
                            </label>
                        </div>
                        <Link to="/signup" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                            Need an account?
                        </Link>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="p-3 text-sm text-red-700 bg-red-100 border border-red-400 rounded-md">
                            {error}
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
                            ${loading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'} 
                            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150`}
                    >
                        {loading ? 'Signing In...' : 'Sign In'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginForm;