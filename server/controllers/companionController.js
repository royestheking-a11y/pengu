import asyncHandler from 'express-async-handler';
import { generateCompanionResponse } from '../utils/geminiCompanion.js';
import User from '../models/userModel.js';
import CompanionChat from '../models/companionChatModel.js';

// @desc    Get user's companion chat history
// @route   GET /api/companion
// @access  Private
export const getCompanionHistory = asyncHandler(async (req, res) => {
    const chat = await CompanionChat.findOne({ user: req.user._id });

    if (chat) {
        res.json(chat.messages);
    } else {
        res.json([]); // Return empty if no history
    }
});

// @desc    Send message to companion and get response
// @route   POST /api/companion/chat
// @access  Private
export const chatWithCompanion = asyncHandler(async (req, res) => {
    const { history } = req.body;

    if (!history || !Array.isArray(history) || history.length === 0) {
        res.status(400);
        throw new Error('Chat history is required');
    }

    // Get user details for personalized prompt
    const user = await User.findById(req.user._id);
    const userGender = user?.gender || 'unknown'; // assuming gender might be added, or fallback

    try {
        const reply = await generateCompanionResponse(history, userGender);

        // Find or create the chat history document
        let chat = await CompanionChat.findOne({ user: req.user._id });
        if (!chat) {
            chat = new CompanionChat({
                user: req.user._id,
                messages: []
            });
        }

        // Get the latest user message from the history array
        const latestUserMessage = history[history.length - 1];

        // Push both the user message and model reply into the database
        chat.messages.push({
            role: 'user',
            content: latestUserMessage.content,
            timestamp: new Date()
        });

        chat.messages.push({
            role: 'model',
            content: reply,
            timestamp: new Date()
        });

        await chat.save();

        res.json({ reply });
    } catch (error) {
        console.error('Companion Chat Error:', error);
        res.status(500);
        throw new Error('Pengu is currently resting. Please try again later.');
    }
});
