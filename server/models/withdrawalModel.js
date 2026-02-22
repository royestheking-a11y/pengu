import mongoose from 'mongoose';

const withdrawalSchema = new mongoose.Schema({
    expertId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    amount: { type: Number, required: true }, // Amount in BDT
    amount_credits: { type: Number }, // Amount in Credits
    method: { type: String, enum: ['bKash', 'Nagad', 'Bank', 'Rocket'] },
    phone_number: { type: String },
    methodId: { type: String }, // ID from Expert's payoutMethods (optional for students)
    methodDetails: {
        type: { type: String },
        accountName: String,
        accountNumber: String,
        bankName: String,
        branchName: String
    },
    status: { type: String, enum: ['PENDING', 'CONFIRMED', 'PAID', 'APPROVED', 'REJECTED'], default: 'PENDING' }
}, {
    timestamps: true
});

const Withdrawal = mongoose.model('Withdrawal', withdrawalSchema);
export default Withdrawal;
