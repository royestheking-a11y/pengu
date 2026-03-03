import mongoose from 'mongoose';

const documentSchema = mongoose.Schema({
    name: { type: String, required: true },
    url: { type: String, required: true },
    type: { type: String, required: true }, // e.g., 'CV', 'Transcript', 'Passport', 'Receipt'
    uploadedAt: { type: Date, default: Date.now },
});

const scholarshipApplicationSchema = mongoose.Schema(
    {
        studentId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        scholarshipId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Scholarship',
        },
        expertId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User', // Assigned expert
        },
        status: {
            type: String,
            enum: [
                'REQUEST_SENT',
                'QUOTE_PROVIDED',
                'PENDING_VERIFICATION',
                'QUOTE_ACCEPTED',
                'EXPERT_ASSIGNED',
                'FINAL_REVIEW',
                'COMPLETED'
            ],
            default: 'REQUEST_SENT',
        },
        customQuoteAmount: {
            type: Number,
        },
        cgpa: {
            type: Number,
            required: true,
        },
        ielts: {
            type: Number,
        },
        major: {
            type: String,
            required: true,
        },
        documentVault: [documentSchema], // Initial documents uploaded by student
        finalReceipts: [documentSchema], // Final submission receipts uploaded by expert
        notes: {
            type: String, // Internal admin/expert notes
        },
        paymentInfo: {
            method: { type: String }, // e.g. 'BKASH', 'NAGAD'
            transactionId: { type: String },
            phoneNumber: { type: String },
            amount: { type: Number },
            paidAt: { type: Date }
        }
    },
    {
        timestamps: true,
    }
);

const ScholarshipApplication = mongoose.model('ScholarshipApplication', scholarshipApplicationSchema);

export default ScholarshipApplication;
