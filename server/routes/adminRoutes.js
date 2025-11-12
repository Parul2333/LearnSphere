// server/routes/adminRoutes.js

import { Router } from 'express';
import { protect, admin } from '../middleware/auth.js';
import { 
    createSubject, 
    addContentToSubject, 
    updateSubjectProgress,
    // 💡 NEW IMPORTS: Branch management functions
    createBranch,
    getAllBranches,
    deleteBranch 
} from '../controllers/adminController.js';

const router = Router();

// --- Existing Routes ---
router.route('/subjects')
    .post(protect, admin, createSubject);

router.route('/content')
    .post(protect, admin, addContentToSubject);

router.route('/subjects/progress/:id')
    .put(protect, admin, updateSubjectProgress);

// --- NEW BRANCH MANAGEMENT ROUTES ---
router.route('/branches') // GET /api/admin/branches
    .get(protect, admin, getAllBranches) // List all branches for manager/dropdowns
    .post(protect, admin, createBranch);  // Create a new branch structure

router.route('/branches/:id') // DELETE /api/admin/branches/:id
    .delete(protect, admin, deleteBranch); // Delete branch (and cascade subjects/content)

export default router;