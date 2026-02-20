import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/userModel.js';
import Expert from './models/expertModel.js';
import connectDB from './config/db.js';

dotenv.config();
connectDB();

const debugExpertUsers = async () => {
    try {
        console.log('--- Debugging Expert Users ---');

        const keyMap = {};

        // 1. Find all users with role 'expert'
        const users = await User.find({ role: 'expert' });
        console.log(`Found ${users.length} users with role 'expert'.`);

        for (const user of users) {
            const expert = await Expert.findOne({ userId: user._id });
            console.log(`User: ${user.email} (${user._id})`);
            if (expert) {
                console.log(`   -> Expert Profile Found: ${expert._id}, Status: ${expert.status}, Onboarding: ${expert.onboardingCompleted}`);
            } else {
                console.log(`   -> ❌ NO EXPERT PROFILE FOUND`);
                // Optionally delete this broken user?
                // await User.findByIdAndDelete(user._id);
                // console.log('   -> Deleted broken user.');
            }
        }

        console.log('-----------------------------');
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

setTimeout(debugExpertUsers, 2000);
