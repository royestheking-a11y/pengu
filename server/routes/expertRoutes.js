import express from 'express';
import { getExperts, getExpertById, updateExpertProfile, toggleExpertStatus, addPayoutMethod, deletePayoutMethod } from '../controllers/expertController.js';
import { protect, admin, expert } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(getExperts);
router.route('/profile').put(protect, expert, updateExpertProfile);
router.route('/:id').get(getExpertById).put(protect, updateExpertProfile);
router.route('/:id/online').put(protect, toggleExpertStatus); // Allow admin or self to toggle? For now admin or self logic needed but kept simple

router.route('/payout-methods').post(protect, expert, addPayoutMethod);
router.route('/payout-methods/:id').delete(protect, expert, deletePayoutMethod);

export default router;
