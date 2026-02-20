import express from 'express';
import { authUser, registerUser, updateUserProfile, getUsers, deleteUser, updateUserStatus, googleAuth } from '../controllers/userController.js';

import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/login', authUser);
router.post('/google', googleAuth);
router.post('/register', registerUser);
router.route('/profile').put(protect, updateUserProfile);
router.route('/users').get(protect, getUsers);
router.route('/users/:id').delete(protect, deleteUser);
router.route('/users/:id/status').put(protect, updateUserStatus);

export default router;
