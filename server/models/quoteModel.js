
import mongoose from 'mongoose';

const negotiationMessageSchema = new mongoose.Schema({
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    senderRole: { type: String, enum: ['student', 'admin', 'expert'], required: true },
    message: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    relatedAmount: { type: Number }
});

const quoteSchema = new mongoose.Schema({
    requestId: { type: mongoose.Schema.Types.ObjectId, ref: 'Request', required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'TK' },
    timeline: { type: String, required: true },
    milestones: [{ type: String }],
    revisions: { type: Number, default: 0 },
    scopeNotes: { type: String },
    expiry: { type: Date },
    status: { type: String, enum: ['PENDING', 'ACCEPTED', 'REJECTED'], default: 'PENDING' },
    version: { type: Number, default: 1 },
    negotiationHistory: [negotiationMessageSchema]
}, {
    timestamps: true
});

const Quote = mongoose.model('Quote', quoteSchema);
export default Quote;
