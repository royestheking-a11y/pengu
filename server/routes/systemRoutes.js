import express from 'express';
import { getSystemStats, getSystemSettings, updateSystemSettings } from '../controllers/systemController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/stats', protect, admin, getSystemStats);
router.get('/settings', protect, admin, getSystemSettings);
router.patch('/settings', protect, admin, updateSystemSettings);

// Health check endpoint for keep-alive
router.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;
