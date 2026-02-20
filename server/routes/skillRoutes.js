import express from 'express';
import { scan, getMySkills, getAll, create, getById, update, remove } from '../controllers/skillController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import multer from 'multer';
import { storage } from '../config/cloudinary.js';

const router = express.Router();
const upload = multer({ storage });

router.route('/').get(protect, admin, getAll).post(protect, create);
router.route('/my').get(protect, getMySkills);
router.post('/scan', protect, upload.single('file'), scan);
router.route('/:id').get(protect, getById).put(protect, update).delete(protect, remove);

export default router;
