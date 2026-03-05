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

// TTL Index: auto-delete companion chat logs after 30 days (in seconds: 30 × 24 × 60 × 60)
companionChatSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 });

const CompanionChat = mongoose.model('CompanionChat', companionChatSchema);

export default CompanionChat;
