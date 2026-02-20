import express from 'express';
import { getSystemStats } from '../controllers/systemController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/stats', protect, admin, getSystemStats);

export default router;
