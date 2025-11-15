// server/routes/analyticsRoutes.js

import { Router } from 'express';
import { protect, admin } from '../middleware/auth.js';
import {
    getAnalytics,
    getGrowthMetrics,
    getEngagementMetrics,
} from '../controllers/analyticsController.js';

const router = Router();

// All analytics routes are protected and require admin role
router.get('/', protect, admin, getAnalytics); // GET /api/admin/analytics
router.get('/growth', protect, admin, getGrowthMetrics); // GET /api/admin/analytics/growth
router.get('/engagement', protect, admin, getEngagementMetrics); // GET /api/admin/analytics/engagement

export default router;
