import express from 'express';
import { getMedicines, createMedicine, deleteMedicine } from '../controllers/medicineController.js';
import { protect, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(requireRole('elder'));

router.route('/')
  .get(getMedicines)
  .post(createMedicine);

router.delete('/:id', deleteMedicine);

export default router;
