import express from 'express';
import { createRequest, getMyRequests, getRequestById, getRequests } from '../controllers/requestController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').post(protect, createRequest).get(protect, admin, getRequests);
router.route('/my').get(protect, getMyRequests);
router.route('/:id').get(protect, getRequestById);

export default router;
