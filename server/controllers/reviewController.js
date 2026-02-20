import asyncHandler from 'express-async-handler';
import Review from '../models/reviewModel.js';
import Expert from '../models/expertModel.js';
import { getIO } from '../socket.js';

// @desc    Create new review
// @route   POST /api/reviews
// @access  Private
const createReview = asyncHandler(async (req, res) => {
    const { orderId, expertId, rating, text } = req.body;

    const review = new Review({
        orderId,
        studentId: req.user._id,
        expertId,
        rating,
        text,
        status: 'PENDING'
    });

    const createdReview = await review.save();

    const io = getIO();
    io.emit('review_created', createdReview);
    if (expertId) io.to(expertId.toString()).emit('review_created', createdReview);

    res.status(201).json(createdReview);
});

// @desc    Get all reviews (Admin)
// @route   GET /api/reviews
// @access  Private/Admin
const getReviews = asyncHandler(async (req, res) => {
    const reviews = await Review.find({}).populate('studentId', 'name').populate('expertId', 'name');
    res.json(reviews);
});

// @desc    Approve/Reject review
// @route   PUT /api/reviews/:id
// @access  Private/Admin
const updateReviewStatus = asyncHandler(async (req, res) => {
    const review = await Review.findById(req.params.id);

    if (review) {
        review.status = req.body.status;
        await review.save();

        // If approved, update Expert rating
        if (req.body.status === 'APPROVED') {
            const expert = await Expert.findOne({ userId: review.expertId });
            if (expert) {
                const currentRating = expert.rating || 0;
                const count = expert.completedOrders || 0;
                // Better logic: Fetch all approved reviews for this expert and recalculate
                // For simplicity/simulation matching store:
                const newRating = Number(((currentRating * (count || 1) + review.rating) / ((count || 1) + 1)).toFixed(1));
                expert.rating = newRating;
                await expert.save();
            }
        }

        const io = getIO();
        io.emit('review_updated', review);
        const expertUserId = review.expertId?._id?.toString() || review.expertId?.toString();
        if (expertUserId) io.to(expertUserId).emit('review_updated', review);

        res.json(review);
    } else {
        res.status(404);
        throw new Error('Review not found');
    }
});

// @desc    Get all public approved reviews
// @route   GET /api/reviews/public
// @access  Public
const getPublicReviews = asyncHandler(async (req, res) => {
    const reviews = await Review.find({ status: 'APPROVED' })
        .populate('studentId', 'name')
        .populate('expertId', 'name specialty')
        .sort({ createdAt: -1 });
    res.json(reviews);
});

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private/Admin
const deleteReview = asyncHandler(async (req, res) => {
    const review = await Review.findById(req.params.id);

    if (review) {
        await review.deleteOne();
        res.json({ message: 'Review removed' });
    } else {
        res.status(404);
        throw new Error('Review not found');
    }
});

// @desc    Get my reviews (as student or expert)
// @route   GET /api/reviews/my
// @access  Private
const getMyReviews = asyncHandler(async (req, res) => {
    // Find reviews where the user is either the student or the expert
    const reviews = await Review.find({
        $or: [
            { studentId: req.user._id },
            { expertId: req.user._id }
        ]
    }).populate('studentId', 'name').populate('expertId', 'name specialty').sort({ createdAt: -1 });
    res.json(reviews);
});

export { createReview, getReviews, updateReviewStatus, getPublicReviews, deleteReview, getMyReviews };
