import express from 'express';
import { protect, requireRole } from '../middleware/authMiddleware.js';
import { getHealthProfile, saveHealthProfile } from '../controllers/healthProfileController.js';
import { generateAIRoutines } from '../controllers/routineController.js';

const router = express.Router();

router.get('/', protect, requireRole('elder'), getHealthProfile);
router.post('/', protect, requireRole('elder'), saveHealthProfile, generateAIRoutines);

export default router;
