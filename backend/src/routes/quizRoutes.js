import express from 'express';
import { getTodayQuiz, submitQuiz } from '../controllers/quizController.js';
import { protect, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(requireRole('elder'));

router.get('/today', getTodayQuiz);
router.post('/submit', submitQuiz);

export default router;
