import asyncHandler from 'express-async-handler';
import Withdrawal from '../models/withdrawalModel.js';
import Expert from '../models/expertModel.js';
import Transaction from '../models/transactionModel.js';
import User from '../models/userModel.js';
import { notifyAdmins } from '../utils/notificationUtils.js';
import { getIO } from '../socket.js';

// @desc    Request a withdrawal
// @route   POST /api/withdrawals
// @access  Private/Expert
const requestWithdrawal = asyncHandler(async (req, res) => {
    const { amount, methodId } = req.body;
    const expert = await Expert.findOne({ userId: req.user._id });

    if (!expert) {
        res.status(404);
        throw new Error('Expert profile not found');
    }

    if (amount <= 0) {
        res.status(400);
        throw new Error('Invalid amount');
    }

    // Check for pending withdrawals
    const pendingWithdrawals = await Withdrawal.find({ expertId: expert._id, status: { $in: ['PENDING', 'CONFIRMED'] } });
    const pendingAmount = pendingWithdrawals.reduce((acc, curr) => acc + curr.amount, 0);

    if (amount > (expert.balance - pendingAmount)) {
        res.status(400);
        throw new Error(`Insufficient funds. Pending requests: ${pendingAmount}`);
    }

    const method = expert.payoutMethods.find(m => m._id.toString() === methodId || m.id === methodId);

    if (!method) {
        res.status(400);
        throw new Error('Invalid payout method selected');
    }

    try {
        const withdrawal = await Withdrawal.create({
            expertId: expert._id,
            amount,
            methodId,
            methodDetails: {
                type: method.type,
                accountName: method.accountName,
                accountNumber: method.accountNumber,
                bankName: method.bankName,
                branchName: method.branchName
            },
            status: 'PENDING'
        });

        // Notify Admins
        await notifyAdmins(
            'New Withdrawal Request',
            `Expert requested withdrawal of ${amount}. Method: ${method.type}`,
            'warning',
            '/admin/withdrawals'
        );

        const io = getIO();
        io.emit('withdrawal_created', withdrawal); // For admins
        if (req.user._id) io.to(req.user._id.toString()).emit('withdrawal_created', withdrawal); // For the expert

        res.status(201).json(withdrawal);
    } catch (error) {
        console.error('[withdrawalController] Create Error:', error);
        res.status(500);
        throw new Error('Failed to create withdrawal request: ' + error.message);
    }
});

// @desc    Get all withdrawal requests (Admin) or My Requests (Expert)
// @route   GET /api/withdrawals
// @access  Private
const getWithdrawals = asyncHandler(async (req, res) => {
    let withdrawals;

    if (req.user.role === 'admin') {
        withdrawals = await Withdrawal.find({}).sort({ createdAt: -1 });
    } else {
        // Find expert profile first
        const expert = await Expert.findOne({ userId: req.user._id });
        if (expert) {
            withdrawals = await Withdrawal.find({ expertId: expert._id }).sort({ createdAt: -1 });
        } else {
            withdrawals = [];
        }
    }

    res.json(withdrawals);
});

// @desc    Update withdrawal status
// @route   PUT /api/withdrawals/:id
// @access  Private/Admin
const updateWithdrawalStatus = asyncHandler(async (req, res) => {
    const { status } = req.body; // CONFIRMED, PAID, REJECTED
    const withdrawal = await Withdrawal.findById(req.params.id);

    if (!withdrawal) {
        res.status(404);
        throw new Error('Withdrawal request not found');
    }

    const expert = await Expert.findById(withdrawal.expertId);
    if (!expert) {
        res.status(404);
        throw new Error('Expert not found');
    }

    // State Transitions
    if (status === 'PAID' && withdrawal.status !== 'PAID') {
        // Deduct balance ONLY when valid PAID status is set
        if (expert.balance < withdrawal.amount) {
            res.status(400);
            throw new Error('Expert balance insufficient for payout');
        }

        expert.balance -= withdrawal.amount;
        // earnings (lifetime) remains same
        await expert.save();

        // Create Transaction
        await Transaction.create({
            type: 'PAYOUT',
            amount: withdrawal.amount,
            expertId: expert.userId, // Transaction model likely uses User ID for referencing
            description: `Withdrawal Paid (ID: ${withdrawal._id.toString().slice(-6)})`,
            status: 'processed' // assuming transaction model has status
        });

        const io = getIO();
        io.emit('expert_updated', expert);
        io.emit('transaction_created', { amount: withdrawal.amount, type: 'PAYOUT' });
    }

    withdrawal.status = status;
    await withdrawal.save();

    const io = getIO();
    io.emit('withdrawal_updated', withdrawal); // Notify admin list

    // Notify the expert specifically using their User ID
    if (expert && expert.userId) {
        io.to(expert.userId.toString()).emit('withdrawal_updated', withdrawal);
    }

    res.json(withdrawal);
});

// @desc    Request a student withdrawal
// @route   POST /api/withdrawals/student/request
// @access  Private/Student
const requestStudentWithdrawal = asyncHandler(async (req, res) => {
    const { amountCredits, method, phoneNumber } = req.body;
    const user = await User.findById(req.user._id);

    if (amountCredits < 500) {
        res.status(400);
        throw new Error('Minimum withdrawal is 500 Credits');
    }

    if (user.pengu_credits < amountCredits) {
        res.status(400);
        throw new Error('Insufficient credits');
    }

    // Enforce Monthly Cycle: Check if student has already withdrawn this month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const existingWithdrawal = await Withdrawal.findOne({
        studentId: user._id,
        status: { $ne: 'REJECTED' },
        createdAt: { $gte: startOfMonth, $lte: endOfMonth }
    });

    if (existingWithdrawal) {
        res.status(400);
        throw new Error('You can only withdraw once per month. Your next cycle begins on the 1st of next month.');
    }

    // Convert to BDT: Credits / 100 * 120
    const amountBDT = (amountCredits / 100) * 120;

    user.pengu_credits -= amountCredits;
    await user.save();

    const withdrawal = await Withdrawal.create({
        studentId: user._id,
        amount: amountBDT,
        amount_credits: amountCredits,
        method,
        phone_number: phoneNumber,
        status: 'PENDING'
    });

    await notifyAdmins(
        'New Student Withdrawal Request',
        `Student ${user.name} requested withdrawal of ৳${amountBDT}. Method: ${method}`,
        'warning',
        '/admin/payments'
    );

    const io = getIO();
    io.emit('withdrawal_created', withdrawal);

    res.status(201).json(withdrawal);
});

// @desc    Approve a student withdrawal
// @route   POST /api/withdrawals/admin/approve
// @access  Private/Admin
const approveStudentWithdrawal = asyncHandler(async (req, res) => {
    const { withdrawalId } = req.body;
    const withdrawal = await Withdrawal.findById(withdrawalId);

    if (!withdrawal) {
        res.status(404);
        throw new Error('Withdrawal not found');
    }

    withdrawal.status = 'APPROVED';
    await withdrawal.save();

    // Create a transaction record for student payout (negative amount or special type)
    await Transaction.create({
        studentId: withdrawal.studentId,
        type: 'PAYOUT',
        amount: withdrawal.amount,
        description: `Student Withdrawal Paid (৳${withdrawal.amount}) via ${withdrawal.method}`,
        status: 'completed'
    });

    const io = getIO();
    io.emit('withdrawal_updated', withdrawal);
    io.emit('transaction_created', { amount: withdrawal.amount, type: 'PAYOUT' });

    res.json(withdrawal);
});

// @desc    Reject a student withdrawal and refund credits
// @route   POST /api/withdrawals/admin/reject
// @access  Private/Admin
const rejectStudentWithdrawal = asyncHandler(async (req, res) => {
    const { withdrawalId } = req.body;
    const withdrawal = await Withdrawal.findById(withdrawalId);

    if (!withdrawal) {
        res.status(404);
        throw new Error('Withdrawal not found');
    }

    if (withdrawal.status === 'REJECTED') {
        res.status(400);
        throw new Error('Withdrawal already rejected');
    }

    withdrawal.status = 'REJECTED';
    await withdrawal.save();

    // Refund credits to user
    const user = await User.findById(withdrawal.studentId);
    if (user) {
        user.pengu_credits += withdrawal.amount_credits;
        await user.save();
    }

    const io = getIO();
    io.emit('withdrawal_updated', withdrawal);

    res.json(withdrawal);
});

export {
    requestWithdrawal,
    getWithdrawals,
    updateWithdrawalStatus,
    requestStudentWithdrawal,
    approveStudentWithdrawal,
    rejectStudentWithdrawal
};

