import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Order from './server/models/orderModel.js';
import Expert from './server/models/expertModel.js';
import Transaction from './server/models/transactionModel.js';

dotenv.config({ path: './server/.env' });

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

const fixOrderPayout = async () => {
    await connectDB();

    const orderId = '6996a034b305d27b77e87add';

    try {
        console.log(`--- Fixing Payout for Order ${orderId} ---`);
        const order = await Order.findById(orderId);

        if (!order) {
            console.log('Order NOT FOUND');
            process.exit(1);
        }

        if (order.status !== 'COMPLETED') {
            console.log(`Order status is ${order.status}, expected COMPLETED. Skipping.`);
            process.exit(0);
        }

        const expert = await Expert.findOne({ userId: order.expertId });
        if (!expert) {
            console.log('Expert profile not found for this order.');
            process.exit(1);
        }

        // Check if transaction already exists to prevent double payout
        const existingTx = await Transaction.findOne({ orderId: orderId, type: 'INCOME' });
        if (existingTx) {
            console.log('Transaction already exists for this order. Skipping payout.');
            console.log(existingTx);
            process.exit(0);
        }

        // Calculate Earnings
        // User said Payout is TK 170. If amount is 200, 15% fee = 30, payout = 170.
        // Let's verify exact amount from order.
        const platformFee = 0.15;
        const earningAmount = Math.round(order.amount * (1 - platformFee)); // TK 170 if order.amount is 200

        console.log(`Order Amount: TK ${order.amount}`);
        console.log(`Calculated Earning: TK ${earningAmount}`);

        // Update Expert
        let currentEarnings = 0;
        if (typeof expert.earnings === 'string') {
            currentEarnings = parseFloat(expert.earnings.replace(/[^\d.-]/g, '')) || 0;
        } else {
            currentEarnings = Number(expert.earnings) || 0;
        }
        const currentBalance = Number(expert.balance) || 0;

        expert.balance = currentBalance + earningAmount;
        // Check if completedOrders needs incrementing? 
        // If order was already completed, maybe completedOrders was already incremented?
        // Let's assume completedOrders is fine if status is COMPLETED, but balance/earnings were missed.
        // Actually safe to not increment completedOrders if it's already high number, but let's check.
        // If balance is 0 and they have completed orders, it's likely previous orders also didn't pay out?
        // But let's just fix this one.

        expert.earnings = currentEarnings + earningAmount;

        await expert.save();
        console.log('Expert Balance & Earnings Updated.');

        // Create Transaction
        await Transaction.create({
            orderId: order._id,
            type: 'INCOME',
            amount: earningAmount,
            expertId: order.expertId,
            studentId: order.studentId,
            description: `Earnings for Order #${order._id.toString().slice(-4)} (Manual Fix)`,
            status: 'completed',
            createdAt: new Date(),
            date: new Date()
        });
        console.log('Transaction Record Created.');

    } catch (e) {
        console.error('Fix Error:', e);
    } finally {
        process.exit();
    }
};

fixOrderPayout();
