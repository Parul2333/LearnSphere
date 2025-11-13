import React from 'react';

// Function to clean up the link for direct external access (if necessary)
const getExternalLink = (originalLink, category) => {
    // For Google Docs/Drive, we usually just use the original share link.
    // For YouTube, the original link works fine.
    return originalLink;
};

// Removed showEmbed state and internal logic
const ContentViewer = ({ contentItem }) => {
    const { title, category, link } = contentItem;
    
    // Determine the final link to open externally
    const externalLink = getExternalLink(link, category);

    const isEmbeddable = 
        category === 'notes' || 
        category === 'syllabus' || 
        category === 'reference_video';

    // --- Aesthetic and Text Setup ---
    let buttonText = 'View Resource';
    let buttonIcon = '🔍'; // Default icon
    let linkClass = 'bg-indigo-600 hover:bg-indigo-700'; // Default button color

    if (category === 'reference_video') {
        buttonText = 'Watch Video';
        buttonIcon = ' ▶️';
    } else if (category === 'notes' || category === 'syllabus') {
        buttonText = 'Preview Document';
        buttonIcon = ' 📄';
        linkClass = 'bg-blue-600 hover:bg-blue-700'; // Different color for documents
    } else {
        // General Info (non-embeddable links)
        buttonText = 'View Link';
        buttonIcon = ' →';
        linkClass = 'bg-gray-600 hover:bg-gray-700';
    }

    return (
        <div className="w-full">
            {/* 💡 FIX: Replace toggle logic with a direct <a> tag */}
            {/* target="_blank" ensures the content opens in a new tab/window */}
            <a
                href={externalLink}
                target="_blank" 
                rel="noopener noreferrer"
                className={`w-full flex items-center justify-center py-2 px-4 border border-transparent rounded-lg 
                            shadow-md text-base font-medium text-white 
                            ${linkClass} transition-colors duration-200`}
            >
                {buttonText} {buttonIcon}
            </a>
        </div>
    );
};

export default ContentViewer;