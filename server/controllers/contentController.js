// server/controllers/contentController.js

import Subject from '../models/Subject.js';
import redis from '../config/redis.js';

const CACHE_EXPIRATION = 3600; // 1 hour for cache expiration

// @desc    Get all subjects (for homepage/year/branch view)
// @route   GET /api/content/subjects
// @access  Public
export const getAllSubjects = async (req, res) => {
    try {
        const subjects = await Subject.find().select('name year branch completionPercentage');
        
        // Cache key is always 'all_subjects_cache'
        const cacheKey = 'all_subjects_cache'; 

        // If Redis is active, store the result
        if (redis) {
            await redis.set(cacheKey, JSON.stringify(subjects), 'EX', CACHE_EXPIRATION);
        }

        res.status(200).json(subjects);

    } catch (error) {
        res.status(500).json({ message: 'Server error fetching subjects', error: error.message });
    }
};

// @desc    Get subject details and all related content (Syllabus, Notes, Videos)
// @route   GET /api/content/subject/:id
// @access  Public
export const getSubjectContent = async (req, res) => {
    const { id } = req.params;
    
    try {
        // Populate the content array to get the full link details
        const subject = await Subject.findById(id).populate('content');

        if (!subject) {
            return res.status(404).json({ message: 'Subject not found.' });
        }

        // If Redis is active and cache was missed (req.cacheKey is present), store the result
        if (redis && req.cacheKey) {
            await redis.set(req.cacheKey, JSON.stringify(subject), 'EX', CACHE_EXPIRATION);
        }

        res.status(200).json(subject);

    } catch (error) {
        res.status(500).json({ message: 'Server error fetching subject content', error: error.message });
    }
};