import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Order from './server/models/orderModel.js';
import Expert from './server/models/expertModel.js';
import Transaction from './server/models/transactionModel.js';

dotenv.config();

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

const debugOrder = async () => {
    await connectDB();

    const orderId = '6996a034b305d27b77e87add'; // Does this look like a valid ObjectId? Usually 24 hex chars.
    // The user provided ID '6996a034b305d27b77e87add' is 24 chars.

    try {
        console.log(`--- Inspecting Order ${orderId} ---`);
        const order = await Order.findById(orderId);

        if (!order) {
            console.log('Order NOT FOUND');
        } else {
            console.log('Order Found:', JSON.stringify(order, null, 2));
            console.log(`Expert ID on Order: ${order.expertId}`);

            if (order.expertId) {
                const expert = await Expert.findOne({ userId: order.expertId });
                console.log('--- Inspecting Associated Expert ---');
                if (expert) {
                    console.log('Expert Found:', JSON.stringify(expert, null, 2));
                    console.log(`Expert Balance: ${expert.balance}, Earnings: ${expert.earnings}`);
                } else {
                    console.log('Expert Profile NOT FOUND for userId:', order.expertId);
                }
            }
        }

        console.log('--- Checking Transactions for this Order ---');
        const txs = await Transaction.find({ orderId: orderId });
        console.log('Transactions:', JSON.stringify(txs, null, 2));

    } catch (e) {
        console.error('Debug Error:', e);
    } finally {
        process.exit();
    }
};

debugOrder();
