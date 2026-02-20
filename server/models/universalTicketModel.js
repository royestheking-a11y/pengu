import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    role: { type: String, enum: ['user', 'assistant'], required: true },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const attachedFileSchema = new mongoose.Schema({
    name: String,
    url: String,
    format: String,
    size: Number
});

const universalTicketSchema = new mongoose.Schema({
    name: { type: String, required: true },
    whatsapp: { type: String, required: true },
    messages: [messageSchema],
    files: [attachedFileSchema],
    aiSummary: { type: String, default: '' },
    status: { type: String, enum: ['pending', 'reviewing', 'resolved'], default: 'pending' },
    adminNote: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('UniversalTicket', universalTicketSchema);
