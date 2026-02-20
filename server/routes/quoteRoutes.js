
import express from 'express';
import { createQuote, getQuotes, getQuotesByRequestId, updateQuote } from '../controllers/quoteController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
    .post(protect, admin, createQuote)
    .get(protect, getQuotes);

router.route('/request/:requestId').get(protect, getQuotesByRequestId);
router.route('/:id').put(protect, updateQuote);

export default router;
