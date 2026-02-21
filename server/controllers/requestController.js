import asyncHandler from 'express-async-handler';
import Request from '../models/requestModel.js';
import Order from '../models/orderModel.js';
import { notifyAdmins } from '../utils/notificationUtils.js';
import { getIO } from '../socket.js';

// @desc    Create a new request
// @route   POST /api/requests
// @access  Private
const createRequest = asyncHandler(async (req, res) => {
    const { topic, serviceType, details, deadline, files, attachments } = req.body;

    const request = new Request({
        studentId: req.user._id, // Assuming authMiddleware attaches user
        topic,
        serviceType,
        details,
        deadline,
        files,
        attachments,
        status: 'SUBMITTED'
    });

    const createdRequest = await request.save();

    // Notify Admins
    await notifyAdmins(
        'New Quote Request',
        `New request received: ${topic} (${serviceType})`,
        'info',
        `/admin/request/${createdRequest._id}`
    );

    // Socket Emit
    const io = getIO();
    io.emit('request_created', createdRequest); // Broadcast to all (admins will pick it up)

    res.status(201).json(createdRequest);
});

// @desc    Get all requests for logged in user
// @route   GET /api/requests/my
// @access  Private
const getMyRequests = asyncHandler(async (req, res) => {
    if (!req.user) {
        res.status(401);
        throw new Error('User context missing');
    }

    try {
        let query = { studentId: req.user._id };

        if (req.user.role === 'expert') {
            const assignedOrders = await Order.find({ expertId: req.user._id });
            const requestIds = assignedOrders.map(o => o.requestId);
            query = { _id: { $in: requestIds } };
        }

        const requests = await Request.find(query);
        res.json(requests);
    } catch (error) {
        console.error('getMyRequests Error:', error);
        res.status(500);
        throw new Error('Failed to fetch requests');
    }
});

// @desc    Get request by ID
// @route   GET /api/requests/:id
// @access  Private
const getRequestById = asyncHandler(async (req, res) => {
    const request = await Request.findById(req.params.id);

    if (request) {
        res.json(request);
    } else {
        res.status(404);
        throw new Error('Request not found');
    }
});

// @desc    Get all requests (Admin)
// @route   GET /api/requests
// @access  Private/Admin
const getRequests = asyncHandler(async (req, res) => {
    const requests = await Request.find({}).populate('studentId', 'id name email');
    res.json(requests);
});

export { createRequest, getMyRequests, getRequestById, getRequests };
