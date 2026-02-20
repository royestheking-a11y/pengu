import express from 'express';
import Message from '../models/messageModel.js';
import { protect } from '../middleware/authMiddleware.js';
import asyncHandler from 'express-async-handler';
import { getIO } from '../socket.js';

const router = express.Router();

import Order from '../models/orderModel.js';

const getMessages = asyncHandler(async (req, res) => {
    const threadId = req.query.threadId;
    let query = {};

    if (threadId) {
        query.threadId = threadId;
    } else if (req.user.role !== 'admin') {
        // Find orders where the user is involved
        const orders = await Order.find({
            $or: [{ studentId: req.user._id }, { expertId: req.user._id }]
        });

        // Construct relevant thread IDs
        const threadIds = orders.flatMap(order => [
            `${order._id}:student`,
            `${order._id}:expert`,
            `${order._id}:support` // Just in case
        ]);

        // Also include support threads directly with user
        threadIds.push(`support:${req.user._id}`);

        query.threadId = { $in: threadIds };
    }

    const messages = await Message.find(query).sort({ createdAt: 1 });
    res.json(messages);
});

const sendMessage = asyncHandler(async (req, res) => {
    const { threadId, content, attachments, senderName } = req.body;

    const message = new Message({
        threadId,
        senderId: req.user._id,
        senderName: senderName || req.user.name,
        content,
        attachments
    });

    const createdMessage = await message.save();

    // Real-time: Emit to the thread room so all participants see the message
    const io = getIO();
    io.to(threadId).emit('new_message', createdMessage);

    res.status(201).json(createdMessage);
});

router.route('/').get(protect, getMessages).post(protect, sendMessage);

export default router;
