import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/db.js';

// Models
import User from './models/userModel.js';
import Expert from './models/expertModel.js';
import Request from './models/requestModel.js';
import Order from './models/orderModel.js';
import Review from './models/reviewModel.js';
import Notification from './models/notificationModel.js';
import Message from './models/messageModel.js';
import Transaction from './models/transactionModel.js';
import Withdrawal from './models/withdrawalModel.js';
import Carousel from './models/carouselModel.js';
import Skill from './models/skillModel.js';
import Course from './models/courseModel.js';
import SyllabusEvent from './models/syllabusModel.js';
import ExpertApplication from './models/expertAppModel.js';
import SystemSettings from './models/systemModel.js';

dotenv.config();
connectDB();

const importData = async () => {
    try {
        console.log('Clearing Database...');
        await User.deleteMany();
        await Expert.deleteMany();
        await Request.deleteMany();
        await Order.deleteMany();
        await Review.deleteMany();
        await Notification.deleteMany();
        await Message.deleteMany();
        await Transaction.deleteMany();
        await Withdrawal.deleteMany();
        await Carousel.deleteMany();
        await Skill.deleteMany();
        await Course.deleteMany();
        await SyllabusEvent.deleteMany();
        await ExpertApplication.deleteMany();
        await SystemSettings.deleteMany();

        console.log('Creating Users...');
        // ... (rest of user creation)
        // --- 1. Users ---
        const users = await User.create([
            { name: 'Admin One', email: 'admin@pengu.com', password: 'password123', role: 'admin', status: 'active', avatar: 'https://i.pravatar.cc/150?u=admin' },
            { name: 'John Student', email: 'student@pengu.com', password: 'password123', role: 'student', status: 'active', avatar: 'https://i.pravatar.cc/150?u=john' },
            { name: 'Alice Smith', email: 'alice@student.com', password: 'password123', role: 'student', status: 'active', avatar: 'https://i.pravatar.cc/150?u=alice' },
            { name: 'Dr. Alan Grant', email: 'alan@expert.com', password: 'password123', role: 'expert', status: 'active', avatar: 'https://i.pravatar.cc/150?u=alan' },
            { name: 'Prof. Ellie Sattler', email: 'ellie@expert.com', password: 'password123', role: 'expert', status: 'active', avatar: 'https://i.pravatar.cc/150?u=ellie' },
            { name: 'Ian Malcolm', email: 'ian@expert.com', password: 'password123', role: 'expert', status: 'active', avatar: 'https://i.pravatar.cc/150?u=ian' } // Chaos Theory Expert
        ]);

        const admin = users[0];
        const student1 = users[1];
        const student2 = users[2];
        const expert1 = users[3]; // Alan
        const expert2 = users[4]; // Ellie
        const expert3 = users[5]; // Ian

        console.log('Creating Experts Profiles...');
        // --- 2. Expert Profiles ---
        const experts = await Expert.create([
            {
                userId: expert1._id,
                specialty: 'Paleontology & Biology',
                status: 'Active',
                online: true,
                rating: 4.9,
                completedOrders: 145,
                earnings: 'TK 150000',
                balance: 25000,
                payoutMethods: [{ type: 'Bank', accountName: 'Alan Grant', accountNumber: '1234567890', bankName: 'Standard Chartered', branchName: 'Gulshan', isPrimary: true }]
            },
            {
                userId: expert2._id,
                specialty: 'Botany & Paleobotany',
                status: 'Active',
                online: false,
                rating: 5.0,
                completedOrders: 89,
                earnings: 'TK 95000',
                balance: 12000,
                payoutMethods: [{ type: 'bKash', accountName: 'Ellie Sattler', accountNumber: '01700000000', isPrimary: true }]
            },
            {
                userId: expert3._id,
                specialty: 'Mathematics & Chaos Theory',
                status: 'Active',
                online: true,
                rating: 4.7,
                completedOrders: 210,
                earnings: 'TK 220000',
                balance: 45000,
                payoutMethods: []
            }
        ]);

        console.log('Creating Requests...');
        // --- 3. Requests ---
        const reqs = await Request.create([
            { studentId: student1._id, serviceType: 'Thesis', topic: 'Impact of AI on Education', details: 'Need help with chapter 3', deadline: new Date(Date.now() + 86400000 * 5), status: 'CONVERTED' },
            { studentId: student2._id, serviceType: 'Assignment', topic: 'Linear Algebra Problems', details: '10 problems from textbook', deadline: new Date(Date.now() + 86400000 * 2), status: 'SUBMITTED' },
            { studentId: student1._id, serviceType: 'Report', topic: 'Business Case Study', details: 'Analysis of local market', deadline: new Date(Date.now() + 86400000 * 7), status: 'QUOTED' }
        ]);

        console.log('Creating Orders...');
        // --- 4. Orders ---
        // Order 1: Completed [Alan]
        const order1 = await Order.create({
            requestId: reqs[0].id, // actually string in schema currently
            studentId: student1._id,
            expertId: expert1._id, // User ID reference
            topic: 'Impact of AI on Education',
            serviceType: 'Thesis',
            status: 'COMPLETED',
            progress: 100,
            milestones: [
                { title: 'Outline', status: 'APPROVED', dueDate: new Date(Date.now() - 86400000 * 10) },
                { title: 'Draft', status: 'APPROVED', dueDate: new Date(Date.now() - 86400000 * 5) },
                { title: 'Final', status: 'APPROVED', dueDate: new Date(Date.now() - 86400000 * 1) }
            ]
        });

        // Order 2: In Progress [Ellie]
        const order2 = await Order.create({
            requestId: 'req_mock_2',
            studentId: student2._id,
            expertId: expert2._id,
            topic: 'Plant Biology Research',
            serviceType: 'Research',
            status: 'IN_PROGRESS',
            progress: 50,
            milestones: [
                { title: 'Literature Review', status: 'APPROVED', dueDate: new Date(Date.now() - 86400000 * 2) },
                { title: 'Data Analysis', status: 'IN_PROGRESS', dueDate: new Date(Date.now() + 86400000 * 3) }
            ]
        });

        // Order 3: Review / QC [Ian] - For AdminQuality testing
        const order3 = await Order.create({
            requestId: 'req_mock_3',
            studentId: student1._id,
            expertId: expert3._id,
            topic: 'Chaos Theory Simulation',
            serviceType: 'Coding',
            status: 'Review',
            progress: 80,
            milestones: [
                { title: 'Base Model', status: 'APPROVED', dueDate: new Date(Date.now() - 86400000 * 5) },
                {
                    title: 'Simulation Script',
                    status: 'DELIVERED', // Key for QC
                    dueDate: new Date(),
                    submissions: ['simulation_v1.py', 'readme.md']
                }
            ]
        });

        // Order 4: New / Unassigned
        const order4 = await Order.create({
            requestId: 'req_mock_4',
            studentId: student2._id,
            topic: 'History Essay',
            serviceType: 'Essay',
            status: 'PAID_CONFIRMED',
            progress: 0,
            milestones: [{ title: 'Full Essay', status: 'PENDING', dueDate: new Date(Date.now() + 86400000 * 4) }]
        });

        console.log('Creating Transactions...');
        // --- 5. Transactions ---
        // Income
        await Transaction.create([
            { orderId: order1._id, studentId: student1._id, type: 'INCOME', amount: 5000, description: 'Payment for Order #1' },
            { orderId: order2._id, studentId: student2._id, type: 'INCOME', amount: 3000, description: 'Payment for Order #2' },
            { orderId: order3._id, studentId: student1._id, type: 'INCOME', amount: 8000, description: 'Payment for Order #3' },
            { orderId: order4._id, studentId: student2._id, type: 'INCOME', amount: 1500, description: 'Payment for Order #4' }
        ]);

        // Commission & Payouts (Mock logic: 85% payout)
        await Transaction.create([
            { orderId: order1._id, expertId: expert1._id, type: 'COMMISSION', amount: 750, description: 'Platform Fee (15%)' }, // 5000 * 0.15
            { orderId: order1._id, expertId: expert1._id, type: 'PAYOUT', amount: 4250, description: 'Payout for Order #1' },
            { orderId: order2._id, expertId: expert2._id, type: 'COMMISSION', amount: 450, description: 'Platform Fee (15%)' }
        ]);

        console.log('Creating Reviews...');
        // --- 6. Reviews ---
        await Review.create([
            { orderId: order1._id, studentId: student1._id, expertId: expert1._id, rating: 5, text: 'Amazing work, Dr. Grant!', status: 'APPROVED' },
            { orderId: order2._id, studentId: student2._id, expertId: expert2._id, rating: 5, text: 'Very detailed analysis.', status: 'PENDING' }
        ]);

        console.log('Creating CMS Data...');
        // --- 7. CMS (Carousel, Courses) ---
        await Carousel.create([
            {
                imageUrl: 'https://images.unsplash.com/photo-1513542789411-b6a5d4d31634?q=80&w=2074&auto=format&fit=crop',
                linkUrl: '/signup',
                order: 1,
                isActive: true,
                title: 'Academic Excellence, Simplified.',
                description: 'Connect with vetted experts for assignment support.',
                buttonText: 'Get Started',
                badge: 'Trusted by 10,000+ Students'
            },
            {
                imageUrl: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=2073&auto=format&fit=crop',
                linkUrl: '/services',
                order: 2,
                isActive: true,
                title: 'Expert Support for Every Subject',
                description: 'From complex algorithms to literature reviews.',
                buttonText: 'Explore Services',
                badge: '50+ Subjects Covered'
            }
        ]);

        await Course.create([{ name: 'CSE 101' }, { name: 'MAT 201' }, { name: 'ENG 102' }, { name: 'PHY 101' }]);

        await SyllabusEvent.create([
            { title: 'Midterm Exam', date: new Date(Date.now() + 86400000 * 10), type: 'Exam', course: 'CSE 101', weight: '30%' },
            { title: 'Lab Final', date: new Date(Date.now() + 86400000 * 15), type: 'Lab', course: 'PHY 101', weight: '20%' }
        ]);

        console.log('Creating Notifications...');
        // --- 8. Notifications ---
        await Notification.create([
            { userId: student1._id, title: 'Order Completed', message: 'Your thesis order has been completed.', type: 'success', read: false },
            { userId: expert3._id, title: 'New Order Available', message: 'Check the pool for new Chaos Theory tasks.', type: 'info', read: true }
        ]);

        console.log('Creating Withdrawals...');
        // --- 9. Withdrawals ---
        await Withdrawal.create([
            { expertId: expert1._id, amount: 5000, methodId: '1', status: 'PENDING' },
            { expertId: expert2._id, amount: 2000, methodId: '1', status: 'PAID' }
        ]);

        console.log('Creating System Settings...');
        await SystemSettings.create({
            commissionRate: 15,
            maintenanceMode: false,
            bannerMessage: 'Welcome to Pengu Assistant V4!'
        });

        console.log('Data Imported Successfully!');
        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

importData();
