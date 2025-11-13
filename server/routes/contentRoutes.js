import { Router } from 'express';
import { getAllSubjects, getSubjectContent } from '../controllers/contentController.js';
import { getAllBranches } from '../controllers/adminController.js'; // 💡 Import Branch function
import { cacheContent } from '../middleware/cache.js';
import { getAccessCount } from '../controllers/siteController.js'; // 💡 NEW IMPORT

const router = Router();

// --- 1. Public Content Retrieval ---

// Get all subjects (used by SubjectList page)
router.route('/subjects')
    .get(cacheContent('all_subjects_cache'), getAllSubjects); 

// Get specific subject details and content
router.route('/subject/:id')
    .get(cacheContent('subject_content'), getSubjectContent); 

// --- 2. Public Structure Retrieval ---

// ✅ NEW PUBLIC ROUTE: Get all Branches (used by Home.jsx)
// This endpoint is critical for the public navigation flow and MUST NOT be protected.
router.route('/branches') 
    .get(getAllBranches); 

router.route('/access-count')
    .get(getAccessCount);

export default router;