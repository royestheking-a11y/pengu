import asyncHandler from 'express-async-handler';
import User from '../models/userModel.js';
import GameSession from '../models/gameSessionModel.js';

// @desc    Submit a game score and update coins
// @route   POST /api/games/submit-score
// @access  Private
const submitScore = asyncHandler(async (req, res) => {
    const { gameId, score, coinsCollected, sessionDurationSeconds, deathCause } = req.body;
    const userId = req.user._id;

    // Basic Anti-Cheat
    // Example: If average speed is too high (score/duration > threshold)
    const MAX_SPEED = 2500; // units per second (adjust based on game testing)
    if (score / sessionDurationSeconds > MAX_SPEED) {
        return res.status(400).json({ message: 'Invalid session data detected (potential cheating)' });
    }

    // Create Game Session record
    const session = await GameSession.create({
        userId,
        gameId,
        score,
        coinsCollected,
        sessionDurationSeconds,
        deathCause
    });

    // Atomic update for User's wallet and best score
    const updateQuery = {
        $inc: { "wallet.coins": coinsCollected }
    };

    // Check if new best score
    const user = await User.findById(userId);
    if (!user.bestScores || !user.bestScores[gameId] || score > user.bestScores[gameId]) {
        updateQuery.$set = { [`bestScores.${gameId}`]: score };
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateQuery, { new: true });

    // Emit socket update for instant frontend reflect
    const { getIO } = await import('../socket.js');
    try {
        getIO().to(userId.toString()).emit('user_updated', updatedUser);
    } catch (err) {
        console.error('Socket emission failed in submitScore:', err.message);
    }

    res.status(201).json({
        message: 'Score submitted successfully',
        newCoins: coinsCollected,
        bestScore: score > (user.bestScores?.[gameId] || 0)
    });
});

// @desc    Get top scores for a game
// @route   GET /api/games/leaderboard/:gameId
// @access  Public
const getLeaderboard = asyncHandler(async (req, res) => {
    const { gameId } = req.params;

    // In a real production app, this would be cached (Redis or specialized collection)
    const topScores = await GameSession.find({ gameId })
        .sort({ score: -1 })
        .limit(10)
        .populate('userId', 'name avatar');

    // Get current user's rank if logged in
    let userRank = null;
    let userBest = null;

    // Check for authorization header manually since this is a public route
    // but we want to show rank if token is provided
    let authUser = req.user;
    if (!authUser && req.headers.authorization) {
        try {
            const token = req.headers.authorization.split(' ')[1];
            const decoded = (await import('jsonwebtoken')).default.verify(token, process.env.JWT_SECRET);
            authUser = await User.findById(decoded.id);
        } catch (e) {
            // Ignore invalid token
        }
    }

    if (authUser) {
        const bestSession = await GameSession.findOne({ gameId, userId: authUser._id }).sort({ score: -1 });
        if (bestSession) {
            userBest = bestSession.score;
            userRank = await GameSession.countDocuments({ gameId, score: { $gt: userBest } }) + 1;
        }
    }

    res.json({
        topScores,
        userRank,
        userBest
    });
});

export { submitScore, getLeaderboard };
