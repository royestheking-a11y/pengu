import asyncHandler from 'express-async-handler';
import Order from '../models/orderModel.js';
import Expert from '../models/expertModel.js';
import Transaction from '../models/transactionModel.js';
import Request from '../models/requestModel.js';
import Quote from '../models/quoteModel.js';
import SystemSettings from '../models/systemModel.js';
import { notifyAdmins } from '../utils/notificationUtils.js';
import { getIO } from '../socket.js';

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find({})
        .populate('studentId', 'name email')
        .populate('expertId', 'name email')
        .populate('requestId');
    res.json(orders);
});

// @desc    Get logged in user orders
// @route   GET /api/orders/my
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find({ studentId: req.user._id }).populate('requestId');
    res.json(orders);
});

// @desc    Get logged in expert orders
// @route   GET /api/orders/expert/my
// @access  Private/Expert
const getExpertOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find({ expertId: req.user._id }).populate('requestId');
    res.json(orders);
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id)
        .populate('studentId', 'name email')
        .populate('expertId', 'name email')
        .populate('requestId');

    if (order) {
        res.json(order);
    } else {
        res.status(404);
        throw new Error('Order not found');
    }
});

// @desc    Update order to paid (Create Order)
// @route   POST /api/orders
// @access  Private
const createOrder = asyncHandler(async (req, res) => {
    const { requestId, topic, serviceType, files, amount, paymentMethod, transactionId, milestones } = req.body;

    const order = new Order({
        studentId: req.user._id,
        requestId,
        topic,
        serviceType,
        amount,
        files,
        paymentMethod,
        transactionId,
        paymentStatus: 'PENDING', // Force manual verification
        status: 'PENDING_VERIFICATION',
        milestones: milestones.map(m => ({ title: m, status: 'PENDING' }))
    });

    const createdOrder = await order.save();

    // Update Request status to CONVERTED
    await Request.findByIdAndUpdate(requestId, { status: 'CONVERTED' });

    // Update related Quote status to ACCEPTED
    await Quote.findOneAndUpdate({ requestId }, { status: 'ACCEPTED' });

    // Notify Admins
    await notifyAdmins(
        'New Order Received',
        `Order verified and created: ${topic}. Amount: ${amount}`,
        'success',
        `/admin/order/${createdOrder._id}`
    );

    // Socket Emit
    const io = getIO();
    io.emit('order_created', createdOrder);
    io.to(req.user._id.toString()).emit('order_created', createdOrder); // Notify student

    res.status(201).json(createdOrder);
});

// @desc    Update order (Assign, Status, Milestones)
// @route   PUT /api/orders/:id
// @access  Private
const updateOrder = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (order) {
        const io = getIO(); // Declare ONCE at top — used in COMPLETED block and after save
        const originalStatus = order.status;

        order.expertId = req.body.expertId || order.expertId;
        order.status = req.body.status || order.status;
        order.files = req.body.files || order.files;
        order.progress = req.body.progress !== undefined ? req.body.progress : order.progress;
        order.revisionsResolved = req.body.revisionsResolved !== undefined ? req.body.revisionsResolved : order.revisionsResolved;

        if (req.body.milestones) {
            order.milestones = req.body.milestones;
        }

        if (req.body.nextMilestone) {
            order.nextMilestone = req.body.nextMilestone;
        }

        if (req.body.annotations) {
            order.annotations = req.body.annotations;
        }

        if (req.body.status === 'COMPLETED' && !order.payoutProcessed && order.expertId) {
            // Mark as processed FIRST to prevent race condition with concurrent requests
            order.payoutProcessed = true;

            // 1. Fetch Dynamic Commission Rate
            let commissionRate = 15;
            try {
                const settings = await SystemSettings.findOne();
                if (settings) commissionRate = settings.commissionRate;
            } catch (err) {
                console.error("Error fetching system settings", err);
            }

            const platformFeePercent = commissionRate / 100;
            const platformProfit = Math.round(order.amount * platformFeePercent);
            const earningAmount = order.amount - platformProfit;

            // 2. Update Expert Balance
            const expert = await Expert.findOne({ userId: order.expertId });
            if (expert) {
                const currentBalance = Number(expert.balance) || 0;
                const currentEarnings = (typeof expert.earnings === 'string')
                    ? parseFloat(expert.earnings.replace(/[^\d.-]/g, '')) || 0
                    : Number(expert.earnings) || 0;

                expert.balance = currentBalance + earningAmount;
                expert.completedOrders = (expert.completedOrders || 0) + 1;
                expert.earnings = currentEarnings + earningAmount;

                await expert.save();

                // 3. Create Transaction Records
                // Expert Earnings
                await Transaction.create({
                    orderId: order._id,
                    type: 'EXPERT_CREDIT',
                    amount: earningAmount,
                    expertId: order.expertId,
                    studentId: order.studentId,
                    description: `Earnings for Order #${order._id.toString().slice(-4)}`,
                    status: 'completed'
                });

                // Platform Commission
                await Transaction.create({
                    orderId: order._id,
                    type: 'COMMISSION',
                    amount: platformProfit,
                    expertId: order.expertId, // Associate with the expert's work
                    studentId: order.studentId,
                    description: `Platform Fee (${commissionRate}%) for Order #${order._id.toString().slice(-4)}`,
                    status: 'completed'
                });

                // Real-time
                const io = getIO();
                io.emit('expert_updated', expert);
                io.emit('transaction_created', { amount: earningAmount, type: 'EXPERT_CREDIT' });
                io.emit('transaction_created', { amount: platformProfit, type: 'COMMISSION' });
            }
        }

        const updatedOrder = await order.save();

        io.emit('order_updated', updatedOrder); // Global for admins

        // Target student and expert rooms
        const studentUserId = updatedOrder.studentId?._id?.toString() || updatedOrder.studentId?.toString();
        const expertUserId = updatedOrder.expertId?._id?.toString() || updatedOrder.expertId?.toString();

        if (studentUserId) io.to(studentUserId).emit('order_updated', updatedOrder);
        if (expertUserId) io.to(expertUserId).emit('order_updated', updatedOrder);

        res.json(updatedOrder);
    } else {
        res.status(404);
        throw new Error('Order not found');
    }
});

// @desc    Verify Payment for Order
// @route   PUT /api/orders/:id/payment/verify
// @access  Private/Admin
const verifyPayment = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (order) {
        order.paymentStatus = 'VERIFIED';
        order.status = 'PAID_CONFIRMED';

        // Create Transaction Record (Income)
        await Transaction.create({
            orderId: order._id,
            type: 'INCOME',
            amount: order.amount,
            studentId: order.studentId,
            description: `Payment Verified for Order #${order._id.toString().slice(-8)}`
        });

        const updatedOrder = await order.save();

        // Real-time: Notify student that payment was verified → order is now confirmed
        const io = getIO();
        io.emit('order_updated', updatedOrder);
        const studentId = updatedOrder.studentId?.toString();
        if (studentId) io.to(studentId).emit('order_updated', updatedOrder);

        res.json(updatedOrder);
    } else {
        res.status(404);
        throw new Error('Order not found');
    }
});
// @route   PUT /api/orders/:id/payment/reject
// @access  Private/Admin
const rejectPayment = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (order) {
        order.paymentStatus = 'FAILED';
        order.status = 'CANCELLED'; // Or keep as is but flag payment issue

        const updatedOrder = await order.save();

        // Real-time: Notify student that payment was rejected
        const io = getIO();
        io.emit('order_updated', updatedOrder);
        const studentId = updatedOrder.studentId?.toString();
        if (studentId) io.to(studentId).emit('order_updated', updatedOrder);

        res.json(updatedOrder);
    } else {
        res.status(404);
        throw new Error('Order not found');
    }
});

// @desc    Update order to delivered
// @route   PUT /api/orders/:id/deliver
// @access  Private/Expert
const updateOrderToDelivered = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (order) {
        order.status = 'DELIVERED';
        const updatedOrder = await order.save();
        res.json(updatedOrder);
    } else {
        res.status(404);
        throw new Error('Order not found');
    }
});



export { getOrders, getMyOrders, getExpertOrders, getOrderById, createOrder, updateOrder, verifyPayment, rejectPayment, updateOrderToDelivered };
