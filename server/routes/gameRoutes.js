import express from 'express';
import { submitScore, getLeaderboard } from '../controllers/gameController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/submit-score', protect, submitScore);
router.get('/leaderboard/:gameId', getLeaderboard);

export default router;
