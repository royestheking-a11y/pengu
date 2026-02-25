import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import {
    submitLead,
    getStudentLeads,
    getAllLeads,
    updateLeadStatus,
    closeDeal
} from '../controllers/leadController.js';

const router = express.Router();

// Student Routes
router.route('/').post(protect, submitLead);
router.route('/my-leads').get(protect, getStudentLeads);

// Admin Routes
router.route('/').get(protect, admin, getAllLeads);
router.route('/:id/status').put(protect, admin, updateLeadStatus);
router.route('/:id/close').put(protect, admin, closeDeal);

export default router;
