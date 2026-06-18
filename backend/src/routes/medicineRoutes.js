import express from 'express';
import { getMedicines, createMedicine, deleteMedicine, markMedicineTaken } from '../controllers/medicineController.js';
import { protect, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(requireRole('elder'));

router.route('/')
  .get(getMedicines)
  .post(createMedicine);

router.delete('/:id', deleteMedicine);
router.put('/:id/taken', markMedicineTaken);

export default router;
