import { Router } from 'express';
import { getExpenses, createExpense, deleteExpense } from '../controllers/expenseController';
import { protect, authorize } from '../middleware/auth';

const router = Router();
router.use(protect);

router.get('/', getExpenses);
router.post('/', authorize('admin', 'accountant'), createExpense);
router.delete('/:id', authorize('admin'), deleteExpense);

export default router;
