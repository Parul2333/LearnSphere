// server/controllers/analyticsController.js

import Subject from '../models/Subject.js';
import Content from '../models/Content.js';
import Branch from '../models/Branch.js';
import User from '../models/User.js';
import redis from '../config/redis.js';

/**
 * @desc    Get comprehensive analytics dashboard data
 * @route   GET /api/admin/analytics
 * @access  Private/Admin
 */
export const getAnalytics = async (req, res) => {
    try {
        // Get counts for key metrics
        // Make Redis call fail-safe so a Redis error doesn't reject the whole Promise.all
        const accessCountPromise =
            redis && redis.status === 'ready'
                ? redis.get('website_access_count').catch(() => 0)
                : Promise.resolve(0);

        const [totalBranches, totalSubjects, totalContent, totalUsers, totalAdmins, accessCount] =
            await Promise.all([
                Branch.countDocuments(),
                Subject.countDocuments(),
                Content.countDocuments(),
                User.countDocuments({ role: 'user' }),
                User.countDocuments({ role: 'admin' }),
                accessCountPromise,
            ]);

        // Get content distribution by category
        const contentByCategory = await Content.aggregate([
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 },
                },
            },
        ]);

        // Get average completion percentage
        const completionStats = await Subject.aggregate([
            {
                $group: {
                    _id: null,
                    avgCompletion: { $avg: '$completionPercentage' },
                    maxCompletion: { $max: '$completionPercentage' },
                    minCompletion: { $min: '$completionPercentage' },
                },
            },
        ]);

        // Get subjects by branch
        const subjectsByBranch = await Subject.aggregate([
            {
                $group: {
                    _id: '$branch',
                    count: { $sum: 1 },
                },
            },
            {
                $lookup: {
                    from: 'branches',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'branchInfo',
                },
            },
            {
                $unwind: '$branchInfo',
            },
            {
                $project: {
                    _id: 0,
                    branchName: '$branchInfo.name',
                    subjectCount: '$count',
                },
            },
        ]);

        // Get top 5 most completed subjects
        const topSubjects = await Subject.find()
            .select('name completionPercentage year branch')
            .populate('branch', 'name')
            .sort({ completionPercentage: -1 })
            .limit(5);

        // Get least completed subjects
        const leastCompletedSubjects = await Subject.find()
            .select('name completionPercentage year branch')
            .populate('branch', 'name')
            .sort({ completionPercentage: 1 })
            .limit(5);

        // Get recent activity (last 10 subjects created)
        const recentActivity = await Subject.find()
            .select('name createdAt branch year')
            .populate('branch', 'name')
            .sort({ createdAt: -1 })
            .limit(10);

        const analytics = {
            summary: {
                totalBranches,
                totalSubjects,
                totalContent,
                totalUsers,
                totalAdmins,
                websiteVisits: parseInt(accessCount) || 0,
            },
            contentDistribution: contentByCategory.reduce((acc, item) => {
                acc[item._id] = item.count;
                return acc;
            }, {}),
            completionStats: completionStats[0] || {
                avgCompletion: 0,
                maxCompletion: 0,
                minCompletion: 0,
            },
            subjectsByBranch,
            topSubjects: topSubjects.map((s) => ({
                name: s.name,
                completion: s.completionPercentage,
                year: s.year,
                branch: s.branch.name,
            })),
            leastCompletedSubjects: leastCompletedSubjects.map((s) => ({
                name: s.name,
                completion: s.completionPercentage,
                year: s.year,
                branch: s.branch.name,
            })),
            recentActivity: recentActivity.map((s) => ({
                name: s.name,
                createdAt: s.createdAt,
                branch: s.branch.name,
                year: s.year,
            })),
        };

        res.json(analytics);
    } catch (error) {
        res.status(500).json({ message: 'Analytics error', error: error.message });
    }
};

/**
 * @desc    Get growth metrics over time
 * @route   GET /api/admin/analytics/growth
 * @access  Private/Admin
 */
export const getGrowthMetrics = async (req, res) => {
    try {
        // Content growth by month
        const contentGrowth = await Content.aggregate([
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' },
                    },
                    count: { $sum: 1 },
                },
            },
            {
                $sort: { '_id.year': 1, '_id.month': 1 },
            },
            {
                $limit: 12, // Last 12 months
            },
        ]);

        // Subject growth by month
        const subjectGrowth = await Subject.aggregate([
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' },
                    },
                    count: { $sum: 1 },
                },
            },
            {
                $sort: { '_id.year': 1, '_id.month': 1 },
            },
            {
                $limit: 12,
            },
        ]);

        res.json({
            contentGrowth,
            subjectGrowth,
        });
    } catch (error) {
        res.status(500).json({ message: 'Growth metrics error', error: error.message });
    }
};

/**
 * @desc    Get user engagement metrics
 * @route   GET /api/admin/analytics/engagement
 * @access  Private/Admin
 */
export const getEngagementMetrics = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments({ role: 'user' });
        const adminCount = await User.countDocuments({ role: 'admin' });

        // Content per branch (safe aggregation: compute content counts per subject first)
        const contentPerBranch = await Subject.aggregate([
            // Attach content items per subject
            {
                $lookup: {
                    from: 'contents',
                    localField: '_id',
                    foreignField: 'subject',
                    as: 'contentItems',
                },
            },
            // Compute content count per subject
            {
                $addFields: {
                    contentCount: { $size: '$contentItems' },
                },
            },
            // Group by branch and sum content counts and subjects
            {
                $group: {
                    _id: '$branch',
                    totalContent: { $sum: '$contentCount' },
                    subjectCount: { $sum: 1 },
                },
            },
            // Join branch info
            {
                $lookup: {
                    from: 'branches',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'branchInfo',
                },
            },
            { $unwind: { path: '$branchInfo', preserveNullAndEmptyArrays: true } },
            // Avoid divide-by-zero by using $cond
            {
                $project: {
                    branchName: '$branchInfo.name',
                    contentPerSubject: {
                        $cond: [
                            { $eq: ['$subjectCount', 0] },
                            0,
                            { $divide: ['$totalContent', '$subjectCount'] },
                        ],
                    },
                    totalContent: 1,
                    subjectCount: 1,
                },
            },
        ]);

        res.json({
            totalUsers,
            adminCount,
            contentPerBranch,
        });
    } catch (error) {
        res.status(500).json({ message: 'Engagement metrics error', error: error.message });
    }
};
