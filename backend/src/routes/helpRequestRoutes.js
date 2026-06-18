import express from 'express';
import { 
  createHelpRequest, 
  getNearbyHelpRequests, 
  acceptHelpRequest, 
  completeHelpRequest, 
  getMyHelpRequests 
} from '../controllers/helpRequestController.js';
import { protect, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .post(requireRole('elder'), createHelpRequest);

router.get('/nearby', requireRole('helper'), getNearbyHelpRequests);
router.get('/mine', getMyHelpRequests);

router.post('/:id/accept', requireRole('helper'), acceptHelpRequest);
router.post('/:id/complete', completeHelpRequest);

export default router;
