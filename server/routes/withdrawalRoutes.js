import express from 'express';
import { requestWithdrawal, getWithdrawals, updateWithdrawalStatus } from '../controllers/withdrawalController.js';
import { protect, admin, expert } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
    .post(protect, expert, requestWithdrawal)
    .get(protect, getWithdrawals);

router.route('/:id')
    .put(protect, admin, updateWithdrawalStatus);

export default router;
