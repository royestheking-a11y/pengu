import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import connectDB from './config/db.js';

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();
const httpServer = createServer(app);

// Middleware
const allowedOrigins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
    origin: allowedOrigins,
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
