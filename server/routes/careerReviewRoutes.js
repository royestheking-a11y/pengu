
import express from 'express';
import { scan, getMyReviews, deleteReview } from '../controllers/careerReviewController.js';
import { protect } from '../middleware/authMiddleware.js';
import { storage } from '../config/cloudinary.js';
import multer from 'multer';

const upload = multer({ storage });
const router = express.Router();

router.get('/', protect, getMyReviews);
router.post('/scan', protect, upload.single('file'), scan);
router.delete('/:id', protect, deleteReview);

export default router;
