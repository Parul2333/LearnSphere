import { Router } from 'express';
import { registerUser, loginUser, getMe } from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';
import { checkLockout } from '../middleware/rateLimiter.js'; // 💡 NEW IMPORT

const router = Router();

// Public routes for authentication
router.post('/register', registerUser);

// 💡 FIX: Apply checkLockout middleware before attempting login
router.post('/login', checkLockout, loginUser); 

// Private route to verify token and get user info
router.get('/me', protect, getMe);

export default router;