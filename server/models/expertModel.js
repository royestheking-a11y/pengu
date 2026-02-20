import mongoose from 'mongoose';
import User from './userModel.js';
const expertSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    bio: { type: String },
    education: { type: String },
    cvUrl: { type: String },
    skills: [String],
    specialty: { type: String, default: 'General Specialist' },
    status: { type: String, enum: ['Pending', 'Active', 'Suspended'], default: 'Pending' },
    online: { type: Boolean, default: false },
    rating: { type: Number, default: 0 },
    completedOrders: { type: Number, default: 0 },
    earnings: { type: Number, default: 0 },
    balance: { type: Number, default: 0 },
    payoutMethods: [{
        type: { type: String },
        accountName: String,
        accountNumber: String,
        bankName: String,
        branchName: String,
        isPrimary: Boolean
    }],
    onboardingCompleted: { type: Boolean, default: false }
}, {
    timestamps: true
});

const Expert = mongoose.model('Expert', expertSchema);
export default Expert;
