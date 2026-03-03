import express from 'express';
import { authUser, registerUser, getUserProfile, updateUserProfile, getUsers, deleteUser, updateUserStatus, googleAuth, convertCoins } from '../controllers/userController.js';

import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/login', authUser);
router.post('/google', googleAuth);
router.post('/register', registerUser);
router.route('/profile')
    .get(protect, getUserProfile)
    .put(protect, updateUserProfile);
router.post('/convert-coins', protect, convertCoins);
router.route('/users').get(protect, getUsers);
router.route('/users/:id').delete(protect, deleteUser);
router.route('/users/:id/status').put(protect, updateUserStatus);

export default router;
