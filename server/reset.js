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
import Quote from './models/quoteModel.js';
import Carousel from './models/carouselModel.js';
import Skill from './models/skillModel.js';
import Course from './models/courseModel.js';
import SyllabusEvent from './models/syllabusModel.js';
import ExpertApplication from './models/expertAppModel.js';
import SystemSettings from './models/systemModel.js';
import CareerAnalysisTemplate from './models/careerAnalysisTemplateModel.js';
import CareerReview from './models/careerReviewModel.js';
import Contact from './models/contactModel.js';
import UniversalTicket from './models/universalTicketModel.js';

dotenv.config();

const resetData = async () => {
    try {
        await connectDB();

        console.log('--- Database Reset Initiated ---');

        console.log('Clearing all collections (except Admin user)...');
        await Promise.all([
            User.deleteMany({ email: { $ne: 'admin@pengu.com' } }),
            Expert.deleteMany(),
            Request.deleteMany(),
            Order.deleteMany(),
            Review.deleteMany(),
            Notification.deleteMany(),
            Message.deleteMany(),
            Transaction.deleteMany(),
            Withdrawal.deleteMany(),
            Quote.deleteMany(),
            Carousel.deleteMany(),
            Skill.deleteMany(),
            Course.deleteMany(),
            SyllabusEvent.deleteMany(),
            ExpertApplication.deleteMany(),
            SystemSettings.deleteMany(),
            CareerAnalysisTemplate.deleteMany(),
            CareerReview.deleteMany(),
            Contact.deleteMany(),
            UniversalTicket.deleteMany()
        ]);

        console.log('Ensuring Production Admin User exists...');
        const adminExists = await User.findOne({ email: 'admin@pengu.com' });
        if (!adminExists) {
            await User.create({
                name: 'Pengu Admin',
                email: 'admin@pengu.com',
                password: 'pengu789',
                role: 'admin',
                status: 'active'
            });
            console.log('✓ Created master admin account');
        } else {
            console.log('✓ Master admin account preserved');
        }

        console.log('Seeding Default System Settings...');
        await SystemSettings.create({
            commissionRate: 15,
            maintenanceMode: false,
            bannerMessage: 'Welcome to Pengu Assistant!'
        });

        console.log('Seeding Custom Platform Reviews...');
        // Need to create an expert profile for these reviews
        const expertUser = await User.create({
            name: 'RizQara Shop',
            email: 'rizqarashop@gmail.com',
            password: 'password123',
            role: 'expert',
            status: 'active'
        });

        await Expert.create({
            userId: expertUser._id,
            specialty: 'Web Design & Assignments',
            status: 'Active',
            online: true,
            rating: 5.0,
            completedOrders: 50,
            earnings: 75000,
            balance: 15000
        });

        const customReviews = [
            { name: 'Ayesha Rahman', text: 'Expert amar website ta exactly amar moto kore design kore dise. On time delivery, fully satisfied!' },
            { name: 'Fahim Islam', text: 'Assignment ta perfect vabe complete kore dise. Communication chilo clear and professional.' },
            { name: 'Nusrat Jahan', text: 'CV update kore interview call paisi! Expert really knew what he was doing.' },
            { name: 'Tanvir Ahmed', text: 'Logo design ta amar expectation er cheye better hoise. Highly recommend this expert.' },
            { name: 'Sadiya Karim', text: 'Project ta deadline er agei deliver paisi. Quality + support both were top notch.' }
        ];

        for (const r of customReviews) {
            const student = await User.create({
                name: r.name,
                email: `${r.name.toLowerCase().replace(/\s+/g, '.')}@example.com`,
                password: 'password123',
                role: 'student',
                status: 'active',
                avatar: `https://i.pravatar.cc/150?u=${encodeURIComponent(r.name)}`
            });

            const order = await Order.create({
                requestId: `PLATFORM_REVIEW_${new mongoose.Types.ObjectId()}`,
                studentId: student._id,
                expertId: expertUser._id,
                topic: 'Platform Testimonial',
                serviceType: 'Professional Assistance',
                amount: 1,
                status: 'COMPLETED',
                progress: 100
            });

            await Review.create({
                orderId: order._id,
                studentId: student._id,
                expertId: expertUser._id,
                rating: 5,
                text: r.text,
                status: 'APPROVED'
            });
        }

        console.log('--- Database Reset & Seeding Successfully Completed ---');
        process.exit();
    } catch (error) {
        console.error(`Error during reset: ${error.message}`);
        process.exit(1);
    }
};

resetData();
