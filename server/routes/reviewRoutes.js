import express from 'express';
import { createReview, getReviews, updateReviewStatus, getPublicReviews, deleteReview, getMyReviews } from '../controllers/reviewController.js';

import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').post(protect, createReview).get(protect, admin, getReviews);
router.route('/my').get(protect, getMyReviews);
router.route('/public').get(getPublicReviews);
router.route('/:id')
    .put(protect, admin, updateReviewStatus)
    .delete(protect, admin, deleteReview);

export default router;
