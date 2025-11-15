import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext.jsx';

// Simple, minimal footer to avoid complexity and ensure reliability
const Footer = () => {
  const { isDarkMode } = useTheme();
  const currentYear = new Date().getFullYear();

  return (
    <footer className={`${isDarkMode ? 'bg-gray-900 text-gray-300' : 'bg-gray-100 text-gray-700'} w-full`}>
      <div className="max-w-6xl mx-auto px-4 py-6 flex items-center justify-between">
        <div className="text-sm">
          <Link to="/" className="font-semibold mr-4">LearnSphere</Link>
          <span>© {currentYear}</span>
        </div>

        <div className="flex items-center gap-4 text-sm">
          <Link to="/contact" className="hover:underline">Contact</Link>
          <Link to="/feedback" className="hover:underline">Feedback</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
