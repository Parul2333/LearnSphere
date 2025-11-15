// server/routes/searchRoutes.js

import { Router } from 'express';
import { globalSearch, getSearchSuggestions, filterContent } from '../controllers/searchController.js';

const router = Router();

// Public search endpoints
router.get('/global', globalSearch); // GET /api/search/global?q=keyword&type=all&branch=id
router.get('/suggestions', getSearchSuggestions); // GET /api/search/suggestions?q=keyword
router.get('/filter', filterContent); // GET /api/search/filter?branch=id&year=year&category=notes

export default router;
