// server/controllers/searchController.js

import Subject from '../models/Subject.js';
import Content from '../models/Content.js';
import Branch from '../models/Branch.js';
import redis from '../config/redis.js';

const SEARCH_CACHE_TIME = 1800; // 30 minutes

/**
 * @desc    Global search across all content
 * @route   GET /api/search?q=keyword&type=all&branch=id&limit=50
 * @access  Public
 */
export const globalSearch = async (req, res) => {
    const { q, type = 'all', branch = '', limit = 50 } = req.query;

    if (!q || q.trim().length < 2) {
        return res.status(400).json({ message: 'Search query must be at least 2 characters.' });
    }

    const cacheKey = `search:${q}:${type}:${branch}:${limit}`;

    try {
        // Check cache first
        if (redis && redis.status === 'ready') {
            const cached = await redis.get(cacheKey);
            if (cached) {
                console.log(`[Cache Hit] Search results for: ${q}`);
                return res.json(JSON.parse(cached));
            }
        }

        const query = q.toLowerCase();
        const results = {
            subjects: [],
            content: [],
            branches: [],
        };

        // Filter by branch if specified
        const branchFilter = branch ? { branch } : {};

        if (type === 'all' || type === 'subjects') {
            results.subjects = await Subject.find(
                {
                    $or: [
                        { name: { $regex: query, $options: 'i' } },
                        { year: { $regex: query, $options: 'i' } },
                    ],
                    ...branchFilter,
                },
                'name year branch completionPercentage'
            )
                .limit(parseInt(limit))
                .lean();
        }

        if (type === 'all' || type === 'content') {
            results.content = await Content.find(
                {
                    $or: [
                        { title: { $regex: query, $options: 'i' } },
                        { category: { $regex: query, $options: 'i' } },
                    ],
                },
                'title category subject link'
            )
                .populate('subject', 'name')
                .limit(parseInt(limit))
                .lean();
        }

        if (type === 'all' || type === 'branches') {
            results.branches = await Branch.find(
                { name: { $regex: query, $options: 'i' } },
                'name years'
            )
                .limit(parseInt(limit))
                .lean();
        }

        // Cache the results
        if (redis && redis.status === 'ready') {
            await redis.set(cacheKey, JSON.stringify(results), 'EX', SEARCH_CACHE_TIME);
        }

        res.json(results);
    } catch (error) {
        res.status(500).json({ message: 'Search error', error: error.message });
    }
};

/**
 * @desc    Get search suggestions (for autocomplete)
 * @route   GET /api/search/suggestions?q=keyword
 * @access  Public
 */
export const getSearchSuggestions = async (req, res) => {
    const { q } = req.query;

    if (!q || q.trim().length < 1) {
        return res.json([]);
    }

    const cacheKey = `suggestions:${q}`;

    try {
        // Check cache
        if (redis && redis.status === 'ready') {
            const cached = await redis.get(cacheKey);
            if (cached) {
                return res.json(JSON.parse(cached));
            }
        }

        const query = q.toLowerCase();

        // Get unique subject names and branch names
        const [subjects, branches] = await Promise.all([
            Subject.find(
                { name: { $regex: query, $options: 'i' } },
                'name'
            )
                .limit(5)
                .lean(),
            Branch.find(
                { name: { $regex: query, $options: 'i' } },
                'name'
            )
                .limit(5)
                .lean(),
        ]);

        const suggestions = [
            ...branches.map((b) => ({ text: b.name, type: 'branch' })),
            ...subjects.map((s) => ({ text: s.name, type: 'subject' })),
        ];

        // Cache for 10 minutes
        if (redis && redis.status === 'ready') {
            await redis.set(cacheKey, JSON.stringify(suggestions), 'EX', 600);
        }

        res.json(suggestions);
    } catch (error) {
        res.status(500).json({ message: 'Suggestions error', error: error.message });
    }
};

/**
 * @desc    Filter content by multiple criteria
 * @route   GET /api/search/filter?branch=id&year=year&category=notes&limit=50
 * @access  Public
 */
export const filterContent = async (req, res) => {
    const { branch = '', year = '', category = '', limit = 50 } = req.query;

    const filters = {};
    if (branch) filters.branch = branch;
    if (year) filters.year = year;
    if (category) filters.category = category;

    try {
        const results = await Subject.find(filters, 'name year branch completionPercentage')
            .populate('content', 'title category link')
            .limit(parseInt(limit))
            .lean();

        res.json(results);
    } catch (error) {
        res.status(500).json({ message: 'Filter error', error: error.message });
    }
};
