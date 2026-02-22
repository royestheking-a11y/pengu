import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    expertId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    type: { type: String, enum: ['INCOME', 'PAYOUT', 'COMMISSION', 'EXPERT_CREDIT', 'STUDENT_EARNING'], required: true },
    amount: { type: Number, required: true },
    description: { type: String, required: true },
    trans_id: { type: String, unique: true, sparse: true },
    status: { type: String, enum: ['completed', 'chargeback'], default: 'completed' }
}, {
    timestamps: true
});

const Transaction = mongoose.model('Transaction', transactionSchema);
export default Transaction;
