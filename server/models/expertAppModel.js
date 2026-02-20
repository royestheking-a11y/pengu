import mongoose from 'mongoose';

const expertAppSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING' },
    skills: [{
        name: String,
        level: String,
        score: Number
    }],
    appliedAt: { type: Date, default: Date.now }
}, {
    timestamps: true
});

const ExpertApplication = mongoose.model('ExpertApplication', expertAppSchema);
export default ExpertApplication;
