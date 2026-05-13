import express from 'express';
import { 
  getRoutines, 
  createRoutine, 
  completeRoutine, 
  deleteRoutine,
  getTodaySummary,
  generateAIRoutines
} from '../controllers/routineController.js';
import { protect, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(requireRole('elder'));

router.route('/').get(getRoutines).post(createRoutine);
router.get('/today-summary', getTodaySummary);
router.post('/generate-ai', generateAIRoutines);
router.put('/:id/complete', completeRoutine);
router.delete('/:id', deleteRoutine);

export default router;
