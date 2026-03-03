import express from 'express';
import {
    getScholarships,
    getScholarshipById,
    submitApplicationIntake,
    getMyApplications,
    createScholarship,
    updateScholarship,
    provideApplicationQuote,
    assignExpert,
    getAllApplications,
    acceptApplicationQuote,
    completeApplication,
    getAssignedApplications,
    uploadFinalReceipts,
    deleteScholarship,
    verifyApplicationPayment,
    autoGenerateScholarship
} from '../controllers/scholarshipController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Administrative routes for applications
router.route('/applications/all').get(protect, admin, getAllApplications);

// AI Generation Route
router.route('/auto-generate').post(protect, admin, autoGenerateScholarship);

// Public/Student routes
router.route('/').get(getScholarships)
    .post(protect, admin, createScholarship);

router.route('/my-applications').get(protect, getMyApplications);
router.route('/expert/assigned').get(protect, getAssignedApplications);

router.route('/:id').get(getScholarshipById)
    .put(protect, admin, updateScholarship)
    .delete(protect, admin, deleteScholarship);

router.route('/:id/apply').post(protect, submitApplicationIntake);

// Application specific administrative/expert routes
router.route('/applications/:id/quote').put(protect, admin, provideApplicationQuote);
router.route('/applications/:id/accept').put(protect, acceptApplicationQuote);
router.route('/applications/:id/verify-payment').put(protect, admin, verifyApplicationPayment);
router.route('/applications/:id/assign').put(protect, admin, assignExpert);
router.route('/applications/:id/finish').put(protect, admin, completeApplication);
router.route('/applications/:id/complete').put(protect, uploadFinalReceipts); // Logic in controller protects this

export default router;
