import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import connectDB from './config/db.js';

// Load env vars
dotenv.config();
console.log('--- Server Boot Sequence ---');
console.log('Environment variables loaded');

// Connect to database
console.log('Connecting to MongoDB...');
connectDB().then(() => {
    console.log('Stage 1: Database Check Passed');
}).catch(err => {
    console.error('Stage 1: Database Connection Failed', err);
});

const app = express();
const httpServer = createServer(app);
console.log('HTTP Server instance created');

// Middleware
const allowedOrigins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "https://pengu-six.vercel.app",
    process.env.FRONTEND_URL
].flatMap(o => o ? o.split(',').map(s => s.trim()) : []);

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Socket.io Setup
import { initSocket } from './socket.js';
const io = initSocket(httpServer);

// Routes Placeholder
app.get('/', (req, res) => {
    res.send('Pengu Assistant API is running...');
});

// Import Routes
import authRoutes from './routes/authRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import requestRoutes from './routes/requestRoutes.js';
import orderRoutes from './routes/orderRoutes.js';

import expertRoutes from './routes/expertRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';
import withdrawalRoutes from './routes/withdrawalRoutes.js';
import carouselRoutes from './routes/carouselRoutes.js';
import skillRoutes from './routes/skillRoutes.js';
import expertAppRoutes from './routes/expertAppRoutes.js';
import courseRoutes from './routes/courseRoutes.js';
import syllabusRoutes from './routes/syllabusRoutes.js';
import careerReviewRoutes from './routes/careerReviewRoutes.js';
import systemRoutes from './routes/systemRoutes.js';
import quoteRoutes from './routes/quoteRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import careerTemplateRoutes from './routes/careerTemplateRoutes.js';
import careerAccelerationRoutes from './routes/careerAccelerationRoutes.js';
import studyToolsRoutes from './routes/studyToolsRoutes.js';
import universalTicketRoutes from './routes/universalTicketRoutes.js';

app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/quotes', quoteRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/experts', expertRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/withdrawals', withdrawalRoutes);
app.use('/api/carousel', carouselRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/expert-applications', expertAppRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/syllabus', syllabusRoutes);
app.use('/api/career-reviews', careerReviewRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/system', systemRoutes);
app.use('/api/career-acceleration', careerAccelerationRoutes);
app.use('/api/career-templates', careerTemplateRoutes);
app.use('/api/study-tools', studyToolsRoutes);
app.use('/api/universal-tickets', universalTicketRoutes);

const PORT = process.env.PORT || 5001;

httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
