import mongoose from 'mongoose';

const scholarshipSchema = mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        universityName: {
            type: String,
        },
        imageUrl: {
            type: String,
        },
        country: {
            type: String,
            required: true,
        },
        deadline: {
            type: Date,
            required: true,
        },
        scholarshipType: {
            type: [String], // Array of 'Fully Funded', 'Tuition Only', 'Monthly Stipend', etc.
            required: true,
            default: ['Fully Funded']
        },
        degreeLevel: {
            type: [String], // Array of 'Bachelors', 'Masters', 'PhD', etc.
            required: true,
        },
        fundingType: {
            type: String, // e.g., 'Fully Funded', 'Partial'
            required: true,
        },
        minCgpa: {
            type: Number,
            default: 0,
        },
        minIelts: {
            type: Number,
            default: 0,
        },
        description: {
            type: String,
            required: true,
        },
        richTextDescription: {
            type: String,
        },
        exampleSopUrl: {
            type: String, // URL to a redacted winning SOP pdf
        },
        status: {
            type: String,
            enum: ['DRAFT', 'PUBLISHED', 'ARCHIVED'],
            default: 'DRAFT',
        },
        baseFee: {
            type: Number, // Estimated default fee, customizable per quote
            required: true,
            default: 0
        },
        expertApplicationFee: {
            type: Number, // Strict fee for manually created funnel
        }
    },
    {
        timestamps: true,
    }
);

const Scholarship = mongoose.model('Scholarship', scholarshipSchema);

export default Scholarship;
