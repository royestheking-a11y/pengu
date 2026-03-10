import mongoose from 'mongoose';

const jobSchema = mongoose.Schema(
    {
        company: {
            type: String,
            required: true,
        },
        role: {
            type: String,
            required: true,
        },
        url: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        atsScore: {
            type: Number,
            default: 0,
        },
        draftedEmail: {
            type: String,
            default: '',
        },
        tailoredCvHighlights: {
            type: [String],
            default: [],
        },
        activeAgent: {
            type: String,
            default: 'Team Lead',
        },
        progress: {
            type: Number,
            default: 0,
        },
        source: {
            type: String,
            default: 'Pengu Chrome Extension',
        },
        targetEmail: {
            type: String,
            default: '',
        },
        sentDate: {
            type: Date,
        },
        status: {
            type: String,
            default: 'scraping',
            enum: [
                'scraping', 'formatting', 'analyzing', 'generating_materials',
                'awaiting_approval', 'approved', 'rejected', 'pending',
                'processing', 'completed', 'failed', 'sent', 'interview_ready'
            ],
        },
        shortlistChance: {
            type: Number,
            default: 0,
        },
        generatedCvUrl: {
            type: String,
            default: '',
        },
        generatedCoverLetterUrl: {
            type: String,
            default: '',
        },
        aiAnalysis: {
            type: Object,
            default: {},
        },
        tailoredCvData: {
            type: Object,
            default: {},
        },
    },
    {
        timestamps: true,
    }
);

const Job = mongoose.model('Job', jobSchema);

export default Job;
