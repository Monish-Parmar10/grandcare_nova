import express from 'express';
import { 
  getRoutines, 
  createRoutine, 
  completeRoutine, 
  getTodaySummary 
} from '../controllers/routineController.js';
import { protect, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(requireRole('elder'));

router.route('/').get(getRoutines).post(createRoutine);
router.get('/today-summary', getTodaySummary);
router.put('/:id/complete', completeRoutine);

export default router;
