import mongoose from 'mongoose';

const withdrawalSchema = new mongoose.Schema({
    expertId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    methodId: { type: String, required: true }, // ID from Expert's payoutMethods
    methodDetails: {
        type: { type: String },
        accountName: String,
        accountNumber: String,
        bankName: String,
        branchName: String
    },
    status: { type: String, enum: ['PENDING', 'CONFIRMED', 'PAID', 'REJECTED'], default: 'PENDING' }
}, {
    timestamps: true
});

const Withdrawal = mongoose.model('Withdrawal', withdrawalSchema);
export default Withdrawal;
