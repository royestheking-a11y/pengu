import express from 'express';
import {
    getMyCourses, create, update, remove, getById
} from '../controllers/courseController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
    .get(protect, getMyCourses)
    .post(protect, create);

router.route('/:id')
    .get(protect, getById)
    .put(protect, update)
    .delete(protect, remove);

export default router;
