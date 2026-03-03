import mongoose from 'mongoose';

const gameSessionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    gameId: { type: String, required: true, index: true }, // e.g., 'pengu_slide'

    // The Run Data
    score: { type: Number, required: true }, // Distance traveled
    coinsCollected: { type: Number, required: true }, // Coins grabbed this specific run

    // Anti-Cheat & Analytics Data
    sessionDurationSeconds: { type: Number, required: true },
    deathCause: { type: String }, // e.g., 'rock', 'snowman'

    timestamp: { type: Date, default: Date.now }
}, {
    timestamps: true
});

// Compound index for querying global leaderboards fast
gameSessionSchema.index({ gameId: 1, score: -1 });

const GameSession = mongoose.model('GameSession', gameSessionSchema);
export default GameSession;
