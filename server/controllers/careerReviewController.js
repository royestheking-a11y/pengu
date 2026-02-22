
import CareerReview from '../models/careerReviewModel.js';
import { scanCareerDocument } from '../utils/careerScanner.js';
import { groqReviewCV } from '../utils/geminiCareer.js';
import { extractText } from '../utils/textExtractor.js';
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
        console.log(`[CareerController] Starting scan for: ${req.file.originalname}`);

        // 1. Extract raw text from document
        const text = await extractText(req.file);
        if (!text || text.trim().length < 50) {
            throw new Error('Document seems empty or could not be parsed.');
        }

        let result;
        let source = 'groq';

        // 2. Attempt Intelligent Scan via Groq
        try {
            console.log('[CareerController] Attempting Groq Intelligent Scan...');
            result = await groqReviewCV(text);
            console.log('[CareerController] ✅ Groq Scan Succeeded');
        } catch (groqError) {
            console.warn('[CareerController] ⚠️ Groq Scan Failed, falling back to Rule-Based Engine:', groqError.message);
            source = 'internal-rules';
            // 3. Fallback to Built-in Rule-Based Scanner
            result = await scanCareerDocument(req.file, text);
        }

        const review = await CareerReview.create({
            userId: req.user._id,
            filename: req.file.originalname,
            ...result
        });

        // Add source to response for debugging/transparency (optional, not in model but helps)
        res.status(201).json({ ...review.toObject(), _source: source });
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
