
import asyncHandler from 'express-async-handler';
import Quote from '../models/quoteModel.js';
import Request from '../models/requestModel.js';
import Order from '../models/orderModel.js';
import { getIO } from '../socket.js';

// @desc    Create a new quote
// @route   POST /api/quotes
// @access  Private/Admin
const createQuote = asyncHandler(async (req, res) => {
    const { requestId, amount, currency, timeline, milestones, revisions, scopeNotes, expiry } = req.body;

    // Check if request exists
    const request = await Request.findById(requestId);
    if (!request) {
        res.status(404);
        throw new Error('Request not found');
    }

    const quote = await Quote.create({
        requestId,
        amount,
        currency,
        timeline,
        milestones,
        revisions,
        scopeNotes,
        expiry,
        status: 'PENDING',
        version: 1
    });

    if (quote) {
        // Update request status to QUOTED
        request.status = 'QUOTED';
        await request.save();

        // Real-time: Notify the student about their new quote
        const io = getIO();
        io.to(request.studentId.toString()).emit('quote_created', quote);
        io.emit('request_updated', request); // Admin/others see request status change

        res.status(201).json(quote);
    } else {
        res.status(400);
        throw new Error('Invalid quote data');
    }
});

// @desc    Get all quotes
// @route   GET /api/quotes
// @access  Private
const getQuotes = asyncHandler(async (req, res) => {
    if (!req.user) {
        res.status(401);
        throw new Error('User context missing');
    }

    try {
        let query = {};

        if (req.user.role === 'student') {
            const myRequests = await Request.find({ studentId: req.user._id });
            const requestIds = myRequests.map(r => r._id);
            query = { requestId: { $in: requestIds } };
        } else if (req.user.role === 'expert') {
            const assignedOrders = await Order.find({ expertId: req.user._id });
            const requestIds = assignedOrders.map(o => o.requestId);
            query = { requestId: { $in: requestIds } };
        }

        const quotes = await Quote.find(query);
        res.json(quotes);
    } catch (error) {
        console.error('getQuotes Error:', error);
        res.status(500);
        throw new Error('Failed to fetch quotes');
    }
});

// @desc    Get quote by Request ID
// @route   GET /api/quotes/request/:requestId
// @access  Private
const getQuotesByRequestId = asyncHandler(async (req, res) => {
    const quotes = await Quote.find({ requestId: req.params.requestId });
    res.json(quotes);
});

// @desc    Update quote (e.g. for negotiation or acceptance)
// @route   PUT /api/quotes/:id
// @access  Private
const updateQuote = asyncHandler(async (req, res) => {
    const quote = await Quote.findById(req.params.id);

    if (quote) {
        if (req.body.status) quote.status = req.body.status;
        if (req.body.amount) quote.amount = req.body.amount;
        // Add more fields as needed

        const updatedQuote = await quote.save();

        // Real-time: Notify all parties of quote update
        const io = getIO();
        io.emit('quote_updated', updatedQuote);

        res.json(updatedQuote);
    } else {
        res.status(404);
        throw new Error('Quote not found');
    }
});

export { createQuote, getQuotes, getQuotesByRequestId, updateQuote };
