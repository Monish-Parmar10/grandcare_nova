import express from 'express';
import { saveMood, getTodayMood } from '../controllers/moodController.js';
import { protect, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(requireRole('elder'));

router.post('/', saveMood);
router.get('/today', getTodayMood);

export default router;
