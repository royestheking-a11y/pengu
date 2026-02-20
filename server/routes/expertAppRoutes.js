import express from 'express';
import createCRUDRoutes from '../controllers/crudController.js';
import ExpertApplication from '../models/expertAppModel.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import asyncHandler from 'express-async-handler';
import { notifyAdmins } from '../utils/notificationUtils.js';

const router = express.Router();
const crud = createCRUDRoutes(ExpertApplication);

// Submit application (User)
const submitApp = asyncHandler(async (req, res) => {
    // Check if pending
    const existing = await ExpertApplication.findOne({ userId: req.user._id, status: 'PENDING' });
    if (existing) {
        res.status(400);
        throw new Error("Application already pending");
    }

    const app = new ExpertApplication({
        userId: req.user._id,
        name: req.user.name,
        email: req.user.email,
        status: 'PENDING'
        // Skills? Can add later if passed
    });

    const createdApp = await app.save();

    // Real-time: Notify admins of new application
    await notifyAdmins(
        'New Expert Application',
        `${req.user.name} has applied to be an expert.`,
        'info',
        '/admin/experts'
    );

    res.status(201).json(createdApp);
});

router.route('/').get(protect, admin, crud.getAll).post(protect, submitApp);
router.route('/:id').get(protect, admin, crud.getById).put(protect, admin, crud.update).delete(protect, admin, crud.remove);

export default router;
