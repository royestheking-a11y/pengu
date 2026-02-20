import express from 'express';

import { getOrders, getMyOrders, getExpertOrders, getOrderById, createOrder, updateOrder, verifyPayment, rejectPayment, updateOrderToDelivered } from '../controllers/orderController.js';
import { protect, admin, expert } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').post(protect, createOrder).get(protect, admin, getOrders);
router.route('/my').get(protect, getMyOrders);
router.route('/expert/my').get(protect, expert, getExpertOrders);
router.route('/:id/deliver').put(protect, expert, updateOrderToDelivered);
router.route('/:id').get(protect, getOrderById).put(protect, updateOrder);
router.route('/:id/payment/verify').put(protect, admin, verifyPayment);
router.route('/:id/payment/reject').put(protect, admin, rejectPayment);

export default router;
