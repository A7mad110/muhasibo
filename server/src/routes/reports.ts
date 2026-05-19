import { Router } from 'express';
import { trialBalance, incomeStatement, balanceSheet, ledger } from '../controllers/reportController';
import { protect } from '../middleware/auth';

const router = Router();
router.use(protect);

router.get('/trial-balance', trialBalance);
router.get('/income-statement', incomeStatement);
router.get('/balance-sheet', balanceSheet);
router.get('/ledger', ledger);

export default router;
