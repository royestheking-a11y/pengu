
import mongoose from 'mongoose';

const careerReviewSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    filename: { type: String, required: true },
    score: { type: String, required: true }, // e.g. "8.5/10"
    status: { type: String, default: 'completed' },
    role: { type: String },
    seniority: { type: String },
    keywordsFound: [{ type: String }],
    keywordsMissing: [{ type: String }],
    analysis: {
        header: { pass: Boolean, note: String },
        summary: { pass: Boolean, note: String },
        skills: { pass: Boolean, note: String },
        experience: { pass: Boolean, note: String },
        projects: { pass: Boolean, note: String },
        whatToUpdate: [{ type: String }]
    },
    date: { type: String, required: true } // e.g. "Oct 15" format used in UI
}, { timestamps: true });

const CareerReview = mongoose.model('CareerReview', careerReviewSchema);
export default CareerReview;
