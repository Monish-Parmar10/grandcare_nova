import express from 'express';
import { protect, requireRole } from '../middleware/authMiddleware.js';
import { getHealthProfile, saveHealthProfile } from '../controllers/healthProfileController.js';
import { generateAIRoutines } from '../controllers/routineController.js';
import HealthProfile from '../models/HealthProfile.js';

const router = express.Router();

router.get('/', protect, requireRole('elder'), getHealthProfile);
router.post('/', protect, requireRole('elder'), saveHealthProfile, generateAIRoutines);
router.put('/', protect, requireRole('elder'), saveHealthProfile, async (req, res, next) => {
  try {
    const profile = await HealthProfile.findOne({ elderId: req.user._id });
    res.json(profile);
  } catch (error) {
    next(error);
  }
});

export default router;
