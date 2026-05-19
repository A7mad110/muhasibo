import { Router } from 'express';
import { getInvoices, createInvoice, updateInvoice, deleteInvoice } from '../controllers/invoiceController';
import { protect, authorize } from '../middleware/auth';

const router = Router();
router.use(protect);

router.get('/', getInvoices);
router.post('/', authorize('admin', 'accountant'), createInvoice);
router.put('/:id', authorize('admin', 'accountant'), updateInvoice);
router.delete('/:id', authorize('admin'), deleteInvoice);

export default router;
