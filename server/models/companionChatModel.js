import mongoose from 'mongoose';

const messageSchema = mongoose.Schema({
    role: {
        type: String,
        enum: ['user', 'model'],
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
});

const companionChatSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
            unique: true, // One chat history per user
        },
        messages: [messageSchema],
    },
    {
        timestamps: true,
    }
);

const CompanionChat = mongoose.model('CompanionChat', companionChatSchema);

export default CompanionChat;
