
import mongoose from 'mongoose';

const careerAnalysisTemplateSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    overallScore: { type: Number, required: true },
    shortlistChance: { type: Number, required: true },
    riskAreas: [{ type: String }],
    suggestions: [{ type: String }],
    date: { type: String, required: true } // e.g. "Oct 15"
}, { timestamps: true });

const CareerAnalysisTemplate = mongoose.model('CareerAnalysisTemplate', careerAnalysisTemplateSchema);
export default CareerAnalysisTemplate;
