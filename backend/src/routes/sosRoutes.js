import express from 'express';
import { getContacts, addContact, deleteContact, triggerSOS } from '../controllers/sosController.js';
import { protect, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(requireRole('elder'));

router.route('/contacts')
  .get(getContacts)
  .post(addContact);

router.delete('/contacts/:id', deleteContact);

router.post('/trigger', triggerSOS);

export default router;
