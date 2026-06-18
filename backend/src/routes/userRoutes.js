import express from 'express';
import { 
  getUserProfile, 
  updateUserProfile, 
  updateUserLocation, 
  getLeaderboard 
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/me').get(protect, getUserProfile).put(protect, updateUserProfile);
router.put('/location', protect, updateUserLocation);
router.get('/leaderboard', protect, getLeaderboard);

export default router;
