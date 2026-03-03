import asyncHandler from 'express-async-handler';
import Scholarship from '../models/scholarshipModel.js';
import ScholarshipApplication from '../models/scholarshipApplicationModel.js';
import User from '../models/userModel.js';
import { getIO } from '../socket.js';
import { generateScholarshipDraft } from '../utils/geminiScholarship.js';

// --- STUDENT ROUTES ---

// @desc    Get all published scholarships (with optional match filtering)
// @route   GET /api/scholarships
// @access  Private (Students)
const getScholarships = asyncHandler(async (req, res) => {
    const { cgpa, ielts, country, admin: isAdminQuery } = req.query;

    let query = { status: 'PUBLISHED' };

    // If admin=true is passed (from admin panel), show all statuses
    if (isAdminQuery === 'true') {
        query = {};
    }

    const scholarships = await Scholarship.find(query).sort({ deadline: 1 });
    res.json(scholarships);
});

// @desc    Get a single scholarship
// @route   GET /api/scholarships/:id
// @access  Private
const getScholarshipById = asyncHandler(async (req, res) => {
    const scholarship = await Scholarship.findById(req.params.id);
    if (scholarship) {
        res.json(scholarship);
    } else {
        res.status(404);
        throw new Error('Scholarship not found');
    }
});

// @desc    Submit an intake/quote request for a scholarship
// @route   POST /api/scholarships/:id/apply
// @access  Private (Student)
const submitApplicationIntake = asyncHandler(async (req, res) => {
    const { cgpa, ielts, major, documentVault } = req.body;
    const scholarshipId = req.params.id;
    const studentId = req.user._id;

    // Check if scholarship exists
    const scholarship = await Scholarship.findById(scholarshipId);
    if (!scholarship) {
        res.status(404);
        throw new Error('Scholarship not found');
    }

    // Check if already applied
    const existingApp = await ScholarshipApplication.findOne({ studentId, scholarshipId });
    if (existingApp) {
        res.status(400);
        throw new Error('You have already submitted an intake for this scholarship');
    }

    const application = await ScholarshipApplication.create({
        studentId,
        scholarshipId,
        cgpa,
        ielts,
        major,
        documentVault: documentVault || [],
        status: 'REQUEST_SENT'
    });

    // Emit socket event for real-time update
    try {
        const io = getIO();
        io.emit('scholarship_application_created', {
            id: application._id,
            studentId,
            scholarshipId,
            status: 'REQUEST_SENT'
        });
    } catch (err) {
        console.error('Socket emission failed:', err.message);
    }

    res.status(201).json(application);
});

// @desc    Get all scholarship applications (Admin View)
// @route   GET /api/scholarships/applications/all
// @access  Private (Admin)
const getAllApplications = asyncHandler(async (req, res) => {
    const applications = await ScholarshipApplication.find({})
        .populate('scholarshipId', 'title country deadline')
        .populate('studentId', 'name email avatar')
        .populate('expertId', 'name avatar')
        .sort({ updatedAt: -1 });

    res.json(applications);
});

// @desc    Get student's own applications (The Pizza Tracker)
// @route   GET /api/scholarships/my-applications
// @access  Private (Student)
const getMyApplications = asyncHandler(async (req, res) => {
    const applications = await ScholarshipApplication.find({ studentId: req.user._id })
        .populate('scholarshipId', 'title country deadline')
        .populate('expertId', 'name avatar')
        .sort({ updatedAt: -1 });

    res.json(applications);
});


// --- ADMIN ROUTES ---

// @desc    Create a new scholarship (Draft)
// @route   POST /api/scholarships
// @access  Private/Admin
const createScholarship = asyncHandler(async (req, res) => {
    const {
        title,
        universityName,
        country,
        deadline,
        degreeLevel,
        scholarshipType,
        minCgpa,
        minIelts,
        description,
        richTextDescription,
        imageUrl,
        expertApplicationFee,
        status
    } = req.body;

    // Handle fundingType sync for backward compatibility if missing
    let fundingType = req.body.fundingType;
    if (!fundingType && Array.isArray(scholarshipType)) {
        fundingType = scholarshipType[0];
    } else if (!fundingType && scholarshipType) {
        fundingType = scholarshipType;
    }

    const scholarship = new Scholarship({
        title,
        universityName,
        country,
        deadline,
        degreeLevel,
        scholarshipType,
        fundingType: fundingType || 'Fully Funded', // Default as fallback
        minCgpa: minCgpa || 0,
        minIelts: minIelts || 0,
        description: description || title,
        richTextDescription: richTextDescription || '',
        imageUrl,
        expertApplicationFee: expertApplicationFee || 0,
        status: status || 'DRAFT',
        baseFee: 0
    });

    const createdScholarship = await scholarship.save();
    res.status(201).json(createdScholarship);
});

// @desc    Auto-generate a new scholarship draft using Gemini AI
// @route   POST /api/scholarships/auto-generate
// @access  Private/Admin
const autoGenerateScholarship = asyncHandler(async (req, res) => {
    try {
        const draftData = await generateScholarshipDraft();

        // Handle fundingType sync for backward compatibility
        let fundingType = draftData.fundingType;
        if (!fundingType && Array.isArray(draftData.scholarshipType)) {
            fundingType = draftData.scholarshipType[0];
        } else if (!fundingType && draftData.scholarshipType) {
            fundingType = draftData.scholarshipType;
        }

        const scholarship = new Scholarship({
            title: draftData.title || 'Untitled AI Draft',
            universityName: draftData.universityName || 'Unknown University',
            country: draftData.country || 'Unknown Country',
            deadline: draftData.deadline || new Date(),
            degreeLevel: draftData.degreeLevel || ['Bachelors'],
            scholarshipType: draftData.scholarshipType || ['Fully Funded'],
            fundingType: fundingType || 'Fully Funded',
            minCgpa: draftData.minCgpa || 3.0,
            minIelts: draftData.minIelts || 6.0,
            description: draftData.description || 'AI Generated Scholarship Draft',
            richTextDescription: draftData.richTextDescription || '<p>AI Generated Draft</p>',
            imageUrl: '', // Requires manual image insertion
            expertApplicationFee: draftData.expertApplicationFee || 10000,
            baseFee: draftData.baseFee || 5000,
            status: 'DRAFT', // Lock status to DRAFT for review
        });

        const createdScholarship = await scholarship.save();
        res.status(201).json(createdScholarship);
    } catch (error) {
        console.error("AI Generation Error: ", error);
        res.status(500);
        throw new Error('Failed to auto-generate scholarship: ' + error.message);
    }
});

// @desc    Update a scholarship
// @route   PUT /api/scholarships/:id
// @access  Private/Admin
const updateScholarship = asyncHandler(async (req, res) => {
    const scholarship = await Scholarship.findById(req.params.id);

    if (scholarship) {
        scholarship.title = req.body.title || scholarship.title;
        scholarship.universityName = req.body.universityName || scholarship.universityName;
        scholarship.country = req.body.country || scholarship.country;
        scholarship.deadline = req.body.deadline || scholarship.deadline;
        scholarship.degreeLevel = req.body.degreeLevel || scholarship.degreeLevel;
        scholarship.scholarshipType = req.body.scholarshipType || scholarship.scholarshipType;

        // Sync fundingType for backward compatibility
        if (req.body.scholarshipType) {
            if (Array.isArray(req.body.scholarshipType)) {
                scholarship.fundingType = req.body.scholarshipType[0] || 'Fully Funded';
            } else {
                scholarship.fundingType = req.body.scholarshipType;
            }
        }

        scholarship.minCgpa = req.body.minCgpa !== undefined ? req.body.minCgpa : scholarship.minCgpa;
        scholarship.minIelts = req.body.minIelts !== undefined ? req.body.minIelts : scholarship.minIelts;
        scholarship.description = req.body.description || scholarship.description;
        scholarship.richTextDescription = req.body.richTextDescription || scholarship.richTextDescription;
        scholarship.imageUrl = req.body.imageUrl || scholarship.imageUrl;
        scholarship.expertApplicationFee = req.body.expertApplicationFee !== undefined ? req.body.expertApplicationFee : scholarship.expertApplicationFee;
        scholarship.status = req.body.status || scholarship.status;

        const updatedScholarship = await scholarship.save();
        res.json(updatedScholarship);
    } else {
        res.status(404);
        throw new Error('Scholarship not found');
    }
});

// @desc    Provide a custom quote for an intake
// @route   PUT /api/scholarships/applications/:id/quote
// @access  Private/Admin
const provideApplicationQuote = asyncHandler(async (req, res) => {
    const { quoteAmount } = req.body;
    const application = await ScholarshipApplication.findById(req.params.id);

    if (application) {
        application.customQuoteAmount = quoteAmount;
        application.status = 'QUOTE_PROVIDED';
        const updatedApp = await application.save();

        // Emit socket event for real-time update
        try {
            const io = getIO();
            io.emit('scholarship_application_updated', {
                id: updatedApp._id,
                studentId: updatedApp.studentId,
                status: updatedApp.status
            });
            // Also notify the specific student
            io.to(updatedApp.studentId.toString()).emit('notification_created', {
                title: "Scholarship Quote Provided",
                message: "An administrator has provided a quote for your scholarship application.",
                type: 'info',
                link: `/scholarship-tracker/${updatedApp._id}`
            });
        } catch (err) {
            console.error('Socket emission failed:', err.message);
        }

        res.json(updatedApp);
    } else {
        res.status(404);
        throw new Error('Application not found');
    }
});

// @desc    Accept a quote and pay via escrow
// @route   PUT /api/scholarships/applications/:id/accept
// @access  Private (Student)
const acceptApplicationQuote = asyncHandler(async (req, res) => {
    const application = await ScholarshipApplication.findById(req.params.id);

    if (application) {
        if (application.studentId.toString() !== req.user._id.toString()) {
            res.status(401);
            throw new Error('Not authorized to accept this quote');
        }

        if (application.status !== 'QUOTE_PROVIDED') {
            res.status(400);
            throw new Error('Application is not in a state to be accepted');
        }

        const { paymentDetails } = req.body;

        if (!paymentDetails || !paymentDetails.transactionId) {
            res.status(400);
            throw new Error('Payment details are required');
        }

        const amount = application.customQuoteAmount || 0;

        // Save payment info and set status to PENDING_VERIFICATION
        application.paymentInfo = {
            method: paymentDetails.method || 'BKASH',
            transactionId: paymentDetails.transactionId,
            phoneNumber: paymentDetails.phoneNumber || '',
            amount: amount,
            paidAt: new Date()
        };

        application.status = 'PENDING_VERIFICATION';
        const updatedApp = await application.save();

        // Emit socket events
        try {
            const io = getIO();
            io.emit('scholarship_application_updated', {
                id: updatedApp._id,
                studentId: updatedApp.studentId,
                status: updatedApp.status
            });
        } catch (err) {
            console.error('Socket emission failed:', err.message);
        }

        res.json(updatedApp);
    } else {
        res.status(404);
        throw new Error('Application not found');
    }
});

// @desc    Verify manual payment and accept quote
// @route   PUT /api/scholarships/applications/:id/verify-payment
// @access  Private/Admin
const verifyApplicationPayment = asyncHandler(async (req, res) => {
    const application = await ScholarshipApplication.findById(req.params.id)
        .populate('studentId', 'username email');

    if (!application) {
        res.status(404);
        throw new Error('Application not found');
    }

    if (application.status !== 'PENDING_VERIFICATION') {
        res.status(400);
        throw new Error('Application is not pending payment verification');
    }

    application.status = 'QUOTE_ACCEPTED';
    const updatedApp = await application.save();

    // Emit socket events
    try {
        const io = getIO();
        io.emit('scholarship_application_updated', {
            id: updatedApp._id,
            studentId: updatedApp.studentId._id,
            status: updatedApp.status
        });

        // Notify student about successful verification
        io.emit('notification_created', {
            user: updatedApp.studentId._id,
            title: 'Payment Verified',
            message: `Your payment for scholarship has been verified!`,
            type: 'PAYMENT'
        });
    } catch (err) {
        console.error('Socket emission failed:', err.message);
    }

    res.json(updatedApp);
});

// @desc    Assign expert to application
// @route   PUT /api/scholarships/applications/:id/assign
// @access  Private/Admin
const assignExpert = asyncHandler(async (req, res) => {
    const { expertId } = req.body;
    const application = await ScholarshipApplication.findById(req.params.id);

    if (application) {
        // Assume student has paid to reach this state in a perfect flow, check logic could go here
        application.expertId = expertId;
        application.status = 'EXPERT_ASSIGNED';
        const updatedApp = await application.save();

        // Emit socket event for real-time update
        try {
            const io = getIO();
            io.emit('scholarship_application_updated', {
                id: updatedApp._id,
                studentId: updatedApp.studentId,
                expertId: updatedApp.expertId,
                status: updatedApp.status
            });
            // Notify student and expert
            io.to(updatedApp.studentId.toString()).emit('notification_created', {
                title: "Expert Assigned",
                message: "A scholarship expert has been assigned to your application.",
                type: 'success',
                link: `/scholarship-tracker/${updatedApp._id}`
            });
            if (updatedApp.expertId) {
                io.to(updatedApp.expertId.toString()).emit('notification_created', {
                    title: "New Assignment",
                    message: "You have been assigned a new scholarship application to handle.",
                    type: 'info',
                    link: `/expert/scholarship-requests`
                });
            }
        } catch (err) {
            console.error('Socket emission failed:', err.message);
        }

        res.json(updatedApp);
    } else {
        res.status(404);
        throw new Error('Application not found');
    }
});

// @desc    Delete a scholarship
// @route   DELETE /api/scholarships/:id
// @access  Private/Admin
const deleteScholarship = asyncHandler(async (req, res) => {
    const scholarship = await Scholarship.findById(req.params.id);

    if (scholarship) {
        await scholarship.deleteOne();
        res.json({ message: 'Scholarship removed' });
    } else {
        res.status(404);
        throw new Error('Scholarship not found');
    }
});

// --- EXPERT ROUTES ---

// @desc    Get firm's assigned applications
// @route   GET /api/scholarships/expert/assigned
// @access  Private/Expert
const getAssignedApplications = asyncHandler(async (req, res) => {
    const applications = await ScholarshipApplication.find({ expertId: req.user._id })
        .populate('scholarshipId', 'title country deadline')
        .populate('studentId', 'name email')
        .sort({ updatedAt: -1 });

    res.json(applications);
});

// @desc    Upload final receipts and complete logic
// @route   PUT /api/scholarships/applications/:id/complete
// @access  Private/Expert
const uploadFinalReceipts = asyncHandler(async (req, res) => {
    const { finalReceipts } = req.body; // Expects array of document objects
    const application = await ScholarshipApplication.findById(req.params.id);

    if (application) {
        // Ensure the logged in expert is the one assigned
        if (application.expertId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            res.status(403);
            throw new Error('Not authorized to update this application');
        }

        application.finalReceipts = finalReceipts;
        application.status = 'FINAL_REVIEW'; // Admin reviews, or could go straight to COMPLETED
        const updatedApp = await application.save();

        // Emit socket event for real-time update
        try {
            const io = getIO();
            io.emit('scholarship_application_updated', {
                id: updatedApp._id,
                studentId: updatedApp.studentId,
                status: updatedApp.status
            });
            // Notify student
            io.to(updatedApp.studentId.toString()).emit('notification_created', {
                title: "Application Updated",
                message: "Your scholarship application has been moved to final review.",
                type: 'info',
                link: `/scholarship-tracker/${updatedApp._id}`
            });
        } catch (err) {
            console.error('Socket emission failed:', err.message);
        }

        res.json(updatedApp);
    } else {
        res.status(404);
        throw new Error('Application not found');
    }
});

// @desc    Complete the scholarship application process
// @route   PUT /api/scholarships/applications/:id/finish
// @access  Private/Admin
const completeApplication = asyncHandler(async (req, res) => {
    const application = await ScholarshipApplication.findById(req.params.id);

    if (application) {
        application.status = 'COMPLETED';
        const updatedApp = await application.save();

        // Emit socket event for real-time update
        try {
            const io = getIO();
            io.emit('scholarship_application_updated', {
                id: updatedApp._id,
                studentId: updatedApp.studentId,
                status: updatedApp.status
            });
            // Notify student
            io.to(updatedApp.studentId.toString()).emit('notification_created', {
                title: "Application Completed!",
                message: "Congratulations! Your scholarship application process is finished and submitted.",
                type: 'success',
                link: `/scholarship-tracker/${updatedApp._id}`
            });
        } catch (err) {
            console.error('Socket emission failed:', err.message);
        }

        res.json(updatedApp);
    } else {
        res.status(404);
        throw new Error('Application not found');
    }
});

export {
    getScholarships,
    getScholarshipById,
    submitApplicationIntake,
    getMyApplications,
    createScholarship,
    updateScholarship,
    provideApplicationQuote,
    assignExpert,
    getAssignedApplications,
    uploadFinalReceipts,
    deleteScholarship,
    getAllApplications,
    acceptApplicationQuote,
    verifyApplicationPayment,
    completeApplication,
    autoGenerateScholarship
};
