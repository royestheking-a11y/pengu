import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';
import User from '../models/userModel.js';
import Order from '../models/orderModel.js';
import Request from '../models/requestModel.js';
import os from 'os';

// @desc    Get system status and stats
// @route   GET /api/system/stats
// @access  Private/Admin
const getSystemStats = asyncHandler(async (req, res) => {
    // 1. Database Health
    const dbStatus = mongoose.connection.readyState === 1 ? 'Healthy' : 'Connecting/Error';

    // 2. Server Vitals
    const uptime = process.uptime();
    const memoryUsage = process.memoryUsage();
    const systemMemory = {
        total: os.totalmem(),
        free: os.freemem(),
        usagePercent: Math.round(((os.totalmem() - os.freemem()) / os.totalmem()) * 100)
    };

    // 3. Application Stats (Real Counts)
    const userCount = await User.countDocuments({});
    const orderCount = await Order.countDocuments({});
    const requestCount = await Request.countDocuments({});
    const activeOrders = await Order.countDocuments({ status: { $in: ['PAID_CONFIRMED', 'ASSIGNED', 'IN_PROGRESS', 'Review'] } });

    res.json({
        status: 'Operational',
        uptime: Math.floor(uptime),
        database: dbStatus,
        memory: {
            rss: Math.round(memoryUsage.rss / 1024 / 1024) + ' MB',
            heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024) + ' MB',
            systemUsagePercent: systemMemory.usagePercent
        },
        counts: {
            users: userCount,
            orders: orderCount,
            requests: requestCount,
            activeOrders
        },
        timestamp: new Date()
    });
});

export { getSystemStats };
