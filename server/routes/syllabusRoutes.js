import express from 'express';
import {
    getAll, getById, create, update, remove, scan, getMyEvents
} from '../controllers/syllabusController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import { storage } from '../config/cloudinary.js';
import multer from 'multer';

const upload = multer({ storage });
const router = express.Router();

// Student/Admin routes
router.route('/').get(protect, getMyEvents).post(protect, create);

router.post('/scan', protect, upload.single('file'), scan);

router.route('/:id')
    .get(protect, getById)
    .put(protect, update) // Allow students to update their own? CRUD controller is generic.
    .delete(protect, remove);

export default router;
