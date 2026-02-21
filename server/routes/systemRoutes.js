import express from 'express';
import { getSystemStats } from '../controllers/systemController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/stats', protect, admin, getSystemStats);

// Health check endpoint for keep-alive
router.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;
