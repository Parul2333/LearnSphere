import { Router } from 'express';
import { getDailyQuote, getAllQuotes, addQuote, deleteQuote, toggleQuoteSelection } from '../controllers/quoteController.js';
// Assuming you have middleware, otherwise remove 'protect' and 'admin'
// import { protect, admin } from '../middleware/authMiddleware.js'; 

const router = Router();

router.get('/daily', getDailyQuote); // Public
router.get('/', getAllQuotes);       // Admin
router.post('/', addQuote);          // Admin
router.delete('/:id', deleteQuote);  // Admin
router.put('/:id/toggle', toggleQuoteSelection); // Admin

export default router;