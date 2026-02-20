import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/userModel.js';
import Expert from './models/expertModel.js';
import connectDB from './config/db.js';

dotenv.config();
connectDB();

const cleanupBrokenUsers = async () => {
    try {
        console.log('--- Cleaning Up Broken Users ---');
        const users = await User.find({ role: 'expert' });

        for (const user of users) {
            const expert = await Expert.findOne({ userId: user._id });
            if (!expert) {
                console.log(`Deleting broken user: ${user.email}`);
                await User.findByIdAndDelete(user._id);
            }
        }
        console.log('Cleanup complete.');
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

setTimeout(cleanupBrokenUsers, 2000);
