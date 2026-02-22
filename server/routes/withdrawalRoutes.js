import express from 'express';
import {
    requestWithdrawal,
    getWithdrawals,
    updateWithdrawalStatus,
    requestStudentWithdrawal,
    approveStudentWithdrawal,
    rejectStudentWithdrawal
} from '../controllers/withdrawalController.js';
import { protect, admin, expert } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
    .post(protect, expert, requestWithdrawal)
    .get(protect, getWithdrawals);

router.route('/student/request')
    .post(protect, requestStudentWithdrawal);

router.route('/admin/approve')
    .post(protect, admin, approveStudentWithdrawal);

router.route('/admin/reject')
    .post(protect, admin, rejectStudentWithdrawal);

router.route('/:id')
    .put(protect, admin, updateWithdrawalStatus);

export default router;

