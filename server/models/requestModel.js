import mongoose from 'mongoose';

const attachmentSchema = new mongoose.Schema({
    name: String,
    type: String,
    size: Number,
    url: String
}, { _id: false });

const requestSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    serviceType: { type: String, required: true },
    topic: { type: String, required: true },
    details: { type: String },
    deadline: { type: Date },
    status: {
        type: String,
        enum: ['SUBMITTED', 'QUOTED', 'NEGOTIATION', 'ACCEPTED', 'EXPIRED', 'CONVERTED'],
        default: 'SUBMITTED'
    },
    files: [String], // Array of strings (URLs)
    attachments: [attachmentSchema]
}, {
    timestamps: true
});

const Request = mongoose.model('Request', requestSchema);
export default Request;
