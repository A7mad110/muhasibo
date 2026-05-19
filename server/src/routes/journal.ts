import { Router } from 'express';
import { getEntries, createEntry, deleteEntry } from '../controllers/journalController';
import { protect, authorize } from '../middleware/auth';

const router = Router();
router.use(protect);

router.get('/', getEntries);
router.post('/', authorize('admin', 'accountant'), createEntry);
router.delete('/:id', authorize('admin'), deleteEntry);

export default router;
