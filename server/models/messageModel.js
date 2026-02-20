import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    threadId: { type: String, required: true }, // e.g., "order:ORDER_ID" or "support:USER_ID"
    senderId: { type: String, required: true }, // User ID or 'system'
    senderName: { type: String, required: true },
    content: { type: String, required: true },
    attachments: [{
        name: String,
        size: String,
        url: String
    }],
    readBy: [{ type: String }] // Array of user IDs who read the message
}, {
    timestamps: true
});

const Message = mongoose.model('Message', messageSchema);
export default Message;
