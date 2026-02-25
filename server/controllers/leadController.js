import asyncHandler from 'express-async-handler';
import Lead from '../models/leadModel.js';
import User from '../models/userModel.js';
import Expert from '../models/expertModel.js';

// @desc    Submit a new lead
// @route   POST /api/leads
// @access  Private (Student/Expert)
export const submitLead = asyncHandler(async (req, res) => {
    const { clientName, clientPhone, projectType, estimatedBudget } = req.body;

    if (!clientName || !clientPhone || !projectType || !estimatedBudget) {
        res.status(400);
        throw new Error('Please provide all required fields');
    }

    const lead = await Lead.create({
        user: req.user._id,
        clientName,
        clientPhone,
        projectType,
        estimatedBudget,
        status: 'Pending',
    });

    if (lead) {
        res.status(201).json(lead);
    } else {
        res.status(400);
        throw new Error('Invalid lead data');
    }
});

// @desc    Get my leads
// @route   GET /api/leads/my-leads
// @access  Private (Student/Expert)
export const getStudentLeads = asyncHandler(async (req, res) => {
    const leads = await Lead.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(leads);
});

// @desc    Get all leads
// @route   GET /api/leads
// @access  Private/Admin
export const getAllLeads = asyncHandler(async (req, res) => {
    const leads = await Lead.find({}).populate('user', 'name email phone role').sort({ createdAt: -1 });
    res.json(leads);
});

// @desc    Update lead status (without closing)
// @route   PUT /api/leads/:id/status
// @access  Private/Admin
export const updateLeadStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;

    const lead = await Lead.findById(req.params.id);

    if (lead) {
        lead.status = status;
        const updatedLead = await lead.save();
        res.json(updatedLead);
    } else {
        res.status(404);
        throw new Error('Lead not found');
    }
});

// @desc    Close a deal and award commission
// @route   PUT /api/leads/:id/close
// @access  Private/Admin
export const closeDeal = asyncHandler(async (req, res) => {
    const { finalProjectValue } = req.body;

    if (!finalProjectValue || finalProjectValue <= 0) {
        res.status(400);
        throw new Error('A valid final project value is required to close the deal');
    }

    const lead = await Lead.findById(req.params.id);

    if (lead) {
        if (lead.status === 'Won') {
            res.status(400);
            throw new Error('This deal has already been marked as Won');
        }

        const commissionEarned = finalProjectValue * 0.30;

        // Update the lead
        lead.status = 'Won';
        lead.finalProjectValue = finalProjectValue;
        lead.commissionEarned = commissionEarned;
        const updatedLead = await lead.save();

        // Award balance/credits
        const partnerUser = await User.findById(lead.user);
        if (partnerUser) {
            if (partnerUser.role === 'student') {
                partnerUser.balance += commissionEarned;
                partnerUser.total_earned = (partnerUser.total_earned || 0) + commissionEarned;
                await partnerUser.save();
            } else if (partnerUser.role === 'expert') {
                // Find expert doc and deposit
                const expertDoc = await Expert.findOne({ userId: partnerUser._id });
                if (expertDoc) {
                    expertDoc.balance += commissionEarned;
                    expertDoc.earnings += commissionEarned;
                    await expertDoc.save();
                }
            }
        }

        res.json({
            lead: updatedLead,
            message: `Deal closed! ৳${commissionEarned} awarded.`
        });
    } else {
        res.status(404);
        throw new Error('Lead not found');
    }
});
