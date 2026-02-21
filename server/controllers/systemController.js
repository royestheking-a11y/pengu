import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';
import User from '../models/userModel.js';
import Order from '../models/orderModel.js';
import Request from '../models/requestModel.js';
import os from 'os';
import SystemSettings from '../models/systemModel.js';

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

// @desc    Get system settings
// @route   GET /api/system/settings
// @access  Private/Admin
const getSystemSettings = asyncHandler(async (req, res) => {
    let settings = await SystemSettings.findOne();
    if (!settings) {
        settings = await SystemSettings.create({
            commissionRate: 15,
            maintenanceMode: false,
            bannerMessage: ''
        });
    }
    res.json(settings);
});

// @desc    Update system settings
// @route   PATCH /api/system/settings
// @access  Private/Admin
const updateSystemSettings = asyncHandler(async (req, res) => {
    const { commissionRate, maintenanceMode, bannerMessage } = req.body;

    const updates = {};
    if (commissionRate !== undefined) updates.commissionRate = commissionRate;
    if (maintenanceMode !== undefined) updates.maintenanceMode = maintenanceMode;
    if (bannerMessage !== undefined) updates.bannerMessage = bannerMessage;

    const settings = await SystemSettings.findOneAndUpdate(
        {},
        { $set: updates },
        { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.json(settings);
});

export { getSystemStats, getSystemSettings, updateSystemSettings };
