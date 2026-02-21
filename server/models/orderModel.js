import mongoose from 'mongoose';

const milestoneSchema = new mongoose.Schema({
    title: { type: String, required: true },
    status: { type: String, enum: ['PENDING', 'IN_PROGRESS', 'DELIVERED', 'APPROVED'], default: 'PENDING' },
    dueDate: { type: Date },
    submissions: [{ type: String }] // URLs from Cloudinary
});

const orderSchema = new mongoose.Schema({
    requestId: { type: mongoose.Schema.Types.ObjectId, ref: 'Request', required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    expertId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    topic: { type: String, required: true },
    serviceType: { type: String, required: true },
    amount: { type: Number, required: true },
    files: [{ type: String }],
    paymentMethod: { type: String }, // e.g. 'bkash', 'card'
    transactionId: { type: String },
    paymentStatus: { type: String, enum: ['PENDING', 'VERIFIED', 'FAILED'], default: 'PENDING' },
    status: {
        type: String,
        enum: ['PENDING_VERIFICATION', 'PAID_CONFIRMED', 'ASSIGNED', 'IN_PROGRESS', 'Review', 'COMPLETED', 'DISPUTE', 'CANCELLED'],
        default: 'PENDING_VERIFICATION'
    },
    progress: { type: Number, default: 0 },
    milestones: [milestoneSchema],
    annotations: [
        new mongoose.Schema({
            id: String,
            fileUrl: String,
            x: Number,
            y: Number,
            text: String,
            author: String,
            timestamp: String,
            resolved: { type: Boolean, default: false }
        })
    ],
    revisionsResolved: { type: Boolean, default: false },
    payoutProcessed: { type: Boolean, default: false } // Idempotency guard — payout runs exactly once
}, {
    timestamps: true
});

const Order = mongoose.model('Order', orderSchema);
export default Order;
