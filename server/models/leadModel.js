import mongoose from 'mongoose';

const leadSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    clientName: {
        type: String,
        required: true,
    },
    clientPhone: {
        type: String,
        required: true,
    },
    projectType: {
        type: String,
        required: true,
        enum: [
            'Web App',
            'Mobile App',
            'UI/UX Design',
            'SEO',
            'Digital Marketing',
            'Graphic Design'
        ],
    },
    estimatedBudget: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        required: true,
        enum: ['Pending', 'Contacted', 'Negotiating', 'Won', 'Lost'],
        default: 'Pending',
    },
    finalProjectValue: {
        type: Number,
        default: 0,
    },
    commissionEarned: {
        type: Number,
        default: 0,
    }
}, {
    timestamps: true
});

const Lead = mongoose.model('Lead', leadSchema);
export default Lead;
