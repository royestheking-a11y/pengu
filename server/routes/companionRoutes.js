import express from 'express';
import { chatWithCompanion, getCompanionHistory } from '../controllers/companionController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(protect, getCompanionHistory);
router.post('/chat', protect, chatWithCompanion);

export default router;
