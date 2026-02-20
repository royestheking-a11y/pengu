import express from 'express';
import createCRUDRoutes from '../controllers/crudController.js';
import Notification from '../models/notificationModel.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import asyncHandler from 'express-async-handler';
import { notifyUser } from '../utils/notificationUtils.js';

const router = express.Router();
const crud = createCRUDRoutes(Notification);

// Specific: Get My Notifications
const getMyNotifications = asyncHandler(async (req, res) => {
    const notifications = await Notification.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(notifications);
});

// Specific: Mark Request as Read
const markAsRead = asyncHandler(async (req, res) => {
    const notification = await Notification.findById(req.params.id);
    if (notification) {
        notification.read = true;
        await notification.save();
        res.json(notification);
    } else {
        res.status(404);
        throw new Error("Not found");
    }
});

// Specific: Clear All for User
const clearAll = asyncHandler(async (req, res) => {
    await Notification.deleteMany({ userId: req.user._id });
    res.json({ message: 'Notifications cleared' });
});

// Specific: Create Notification (with userId logic)
const createNotification = asyncHandler(async (req, res) => {
    let { userId, title, message, type, link } = req.body;

    // Default to self if not specified
    if (!userId) {
        userId = req.user._id;
    }

    // Role-based validation
    if (userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        res.status(403);
        throw new Error("Not authorized to create notification for this user");
    }

    const notification = await notifyUser(userId, title, message, type, link);

    res.status(201).json(notification);
});

router.route('/').get(protect, admin, crud.getAll).post(protect, createNotification); // Admin can view all, anyone can create (with checks)
router.route('/my').get(protect, getMyNotifications);
router.route('/clear').delete(protect, clearAll);
router.route('/:id').get(protect, crud.getById).delete(protect, crud.remove);
router.route('/:id/read').put(protect, markAsRead);

export default router;
