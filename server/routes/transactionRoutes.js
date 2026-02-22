import express from 'express';
import createCRUDRoutes from '../controllers/crudController.js';
import Transaction from '../models/transactionModel.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import asyncHandler from 'express-async-handler';
import { handleCPXWebhook } from '../controllers/transactionController.js';

const router = express.Router();
const crud = createCRUDRoutes(Transaction);

router.route('/cpx').get(handleCPXWebhook);


const getTransactions = asyncHandler(async (req, res) => {
    if (req.user.role === 'admin') {
        const txs = await Transaction.find({}).sort({ createdAt: -1 });
        res.json(txs);
    } else {
        // Find transactions where user is student OR expert
        const txs = await Transaction.find({
            $or: [{ studentId: req.user._id }, { expertId: req.user._id }] // using user._id for both usually works if consistent
            // Wait, expertId in transaction might be UserID or ExpertID?
            // In orderController: expertId: order.expertId which is UserID.
        }).sort({ createdAt: -1 });
        res.json(txs);
    }
});

router.route('/')
    .get(protect, getTransactions)
    .post(protect, crud.create);

router.route('/my').get(protect, getTransactions); // Redirect to same logic
router.route('/:id').get(protect, crud.getById);

export default router;
