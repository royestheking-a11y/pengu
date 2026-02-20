import asyncHandler from 'express-async-handler';
import Expert from '../models/expertModel.js';
import User from '../models/userModel.js';
import { getIO } from '../socket.js';

// @desc    Get all experts
// @route   GET /api/experts
// @access  Public
const getExperts = asyncHandler(async (req, res) => {
    const experts = await Expert.find({}).populate('userId', 'name email avatar phone');

    // Transform data to match frontend structure
    const formattedExperts = experts.map(expert => ({
        id: expert._id, // Expert Document ID
        userId: expert.userId._id, // User ID (for matching)
        name: expert.userId.name,
        email: expert.userId.email,
        avatar: expert.userId.avatar,
        phone: expert.userId.phone,
        specialty: expert.specialty,
        status: expert.status,
        online: expert.online,
        rating: expert.rating,
        completedOrders: expert.completedOrders,
        earnings: expert.earnings,
        balance: expert.balance,
        payoutMethods: expert.payoutMethods,
        onboardingCompleted: expert.onboardingCompleted,
        bio: expert.bio,
        education: expert.education,
        skills: expert.skills,
        cvUrl: expert.cvUrl,
        joinDate: expert.createdAt
    }));

    res.json(formattedExperts);
});

// @desc    Get expert profile by ID
// @route   GET /api/experts/:id
// @access  Public
const getExpertById = asyncHandler(async (req, res) => {
    const expert = await Expert.findOne({ userId: req.params.id }).populate('userId', 'name email avatar phone');

    if (expert) {
        res.json({
            id: expert._id, // Expert ID
            userId: expert.userId._id, // User ID
            name: expert.userId.name,
            email: expert.userId.email,
            avatar: expert.userId.avatar,
            phone: expert.userId.phone,
            specialty: expert.specialty,
            status: expert.status,
            online: expert.online,
            rating: expert.rating,
            completedOrders: expert.completedOrders,
            earnings: expert.earnings,
            balance: expert.balance,
            payoutMethods: expert.payoutMethods,
            onboardingCompleted: expert.onboardingCompleted,
            bio: expert.bio,
            education: expert.education,
            skills: expert.skills,
            cvUrl: expert.cvUrl,
            joinDate: expert.createdAt
        });
    } else {
        res.status(404);
        throw new Error('Expert not found');
    }
});

// @desc    Update expert profile
// @route   PUT /api/experts/profile
// @access  Private/Expert
const updateExpertProfile = asyncHandler(async (req, res) => {
    let targetId = req.params.id || req.user._id;

    const expert = await Expert.findOne({
        $or: [{ userId: targetId }, { _id: targetId }]
    });

    if (!expert) {
        res.status(404);
        throw new Error('Expert not found');
    }

    // Permission check: Admin or the expert themselves
    if (req.user.role !== 'admin' && expert.userId.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Not authorized to update this profile');
    }

    if (expert) {
        expert.name = req.body.name || expert.name;
        expert.specialty = req.body.specialty || expert.specialty;
        expert.bio = req.body.bio || expert.bio;
        expert.rate = req.body.rate || expert.rate;
        expert.status = req.body.status || expert.status; // Admin can update status here too

        if (req.body.skills) expert.skills = req.body.skills;
        if (req.body.education) expert.education = req.body.education;
        if (req.body.cvUrl) expert.cvUrl = req.body.cvUrl;

        if (req.body.onboardingCompleted !== undefined) {
            expert.onboardingCompleted = req.body.onboardingCompleted;

            // If onboarding is completed, also update the User document
            if (expert.onboardingCompleted && expert.userId) {
                await User.findByIdAndUpdate(expert.userId, { onboardingCompleted: true });
            }
        }

        const updatedExpert = await expert.save();

        // Real-time: Notify expert and admins
        const io = getIO();
        io.emit('expert_updated', updatedExpert);
        if (updatedExpert.userId) io.to(updatedExpert.userId.toString()).emit('expert_updated', updatedExpert);

        res.json(updatedExpert);
    } else {
        res.status(404);
        throw new Error('Expert not found');
    }
});

// @desc    Toggle expert online status
// @route   PUT /api/experts/:id/online
// @access  Private/Admin
const toggleExpertStatus = asyncHandler(async (req, res) => {
    const expert = await Expert.findById(req.params.id);
    if (expert) {
        expert.online = !expert.online;
        await expert.save();

        // Real-time: Notify everyone (experts list update)
        const io = getIO();
        io.emit('expert_updated', { id: expert._id, userId: expert.userId, online: expert.online });
        if (expert.userId) io.to(expert.userId.toString()).emit('expert_updated', { id: expert._id, userId: expert.userId, online: expert.online });

        res.json({ online: expert.online });
    } else {
        res.status(404);
        throw new Error('Expert not found');
    }
});

// @desc    Add payout method
// @route   POST /api/experts/payout-methods
// @access  Private/Expert
const addPayoutMethod = asyncHandler(async (req, res) => {
    const expert = await Expert.findOne({ userId: req.user._id });
    if (expert) {
        const newMethod = {
            type: req.body.type,
            accountName: req.body.accountName,
            accountNumber: req.body.accountNumber,
            bankName: req.body.bankName,
            branchName: req.body.branchName,
            isPrimary: expert.payoutMethods.length === 0 // First one is primary
        };

        expert.payoutMethods.push(newMethod);
        const updatedExpert = await expert.save();
        res.status(201).json(updatedExpert.payoutMethods[updatedExpert.payoutMethods.length - 1]);
    } else {
        res.status(404);
        throw new Error('Expert profile not found');
    }
});

// @desc    Delete payout method
// @route   DELETE /api/experts/payout-methods/:id
// @access  Private/Expert
const deletePayoutMethod = asyncHandler(async (req, res) => {
    const expert = await Expert.findOne({ userId: req.user._id });
    if (expert) {
        expert.payoutMethods = expert.payoutMethods.filter(
            (method) => method._id.toString() !== req.params.id
        );
        await expert.save();
        res.json({ message: 'Payout method removed' });
    } else {
        res.status(404);
        throw new Error('Expert profile not found');
    }
});

export {
    getExperts,
    getExpertById,
    updateExpertProfile,
    toggleExpertStatus,
    addPayoutMethod,
    deletePayoutMethod
};


