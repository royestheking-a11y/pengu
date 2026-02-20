
import CareerReview from '../models/careerReviewModel.js';
import { scanCareerDocument } from '../utils/careerScanner.js';
import asyncHandler from 'express-async-handler';

// @desc    Scan CV/Cover Letter
// @route   POST /api/career-reviews/scan
// @access  Private
const scan = asyncHandler(async (req, res) => {
    if (!req.file) {
        res.status(400);
        throw new Error('No file uploaded');
    }

    try {
        const result = await scanCareerDocument(req.file);

        const review = await CareerReview.create({
            userId: req.user._id,
            filename: req.file.originalname,
            ...result
        });

        res.status(201).json(review);
    } catch (error) {
        console.error('[CareerController] Scan Failed:', error);
        res.status(500).json({
            message: `Document analysis failed: ${error.message}`
        });
    }
});

// @desc    Get my reviews
// @route   GET /api/career-reviews
// @access  Private
const getMyReviews = asyncHandler(async (req, res) => {
    const reviews = await CareerReview.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(reviews);
});

// @desc    Delete a review
// @route   DELETE /api/career-reviews/:id
// @access  Private
const deleteReview = asyncHandler(async (req, res) => {
    const review = await CareerReview.findById(req.params.id);
    if (!review) {
        res.status(404);
        throw new Error('Review not found');
    }

    if (review.userId.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error('Not authorized');
    }

    await review.deleteOne();
    res.json({ message: 'Review removed' });
});

export {
    scan,
    getMyReviews,
    deleteReview
};
