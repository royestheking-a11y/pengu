import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import connectDB from './config/db.js';
import { authLimiter, aiLimiter } from './middleware/rateLimiter.js';

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
    "http://localhost:5175",
    "http://localhost:5176",
    "http://localhost:5177",
    "https://pengu-six.vercel.app",
    "https://pengu.work.gd",
    "https://pengui.tech",
    "https://www.pengui.tech",
    "chrome-extension://lmneidfkcpfhghckmojlklfecekbdoik",
    process.env.FRONTEND_URL
].flatMap(o => o ? o.split(',').map(s => s.trim()) : []);

console.log('--- [CORS] Whitelist:', allowedOrigins);

const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps)
        if (!origin) return callback(null, true);

        const isAllowed = allowedOrigins.includes(origin) ||
            (origin.endsWith('.vercel.app') && origin.includes('pengu'));

        if (isAllowed) {
            callback(null, true);
        } else {
            console.warn(`--- [CORS] Blocked Origin: ${origin}`);
            callback(null, false); // Don't throw error, just don't allow
        }
    },
    credentials: true,
    optionsSuccessStatus: 200 // Response for preflight success
};

app.use(cors(corsOptions));
// Body limit: 50mb for JSON (file uploads can be large for CV/CL buffers)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ── Rate Limiting ─────────────────────────────────────────────────────────────
// Auth: 10 requests per 15 minutes per IP (brute-force protection)
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/google', authLimiter);

// AI routes: 5 requests per minute per IP (quota protection)
app.use('/api/study-tools', aiLimiter);
app.use('/api/companion', aiLimiter);
app.use('/api/career-acceleration', aiLimiter);
app.use('/api/career-reviews', aiLimiter);
app.use('/api/syllabus', aiLimiter);
app.use('/api/resume-builder', aiLimiter);

// Socket.io Setup
import { initSocket } from './socket.js';
const io = initSocket(httpServer);

// Import Routes
import authRoutes from './routes/authRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import requestRoutes from './routes/requestRoutes.js';
import quoteRoutes from './routes/quoteRoutes.js';
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
import contactRoutes from './routes/contactRoutes.js';
import systemRoutes from './routes/systemRoutes.js';
import careerAccelerationRoutes from './routes/careerAccelerationRoutes.js';
import careerTemplateRoutes from './routes/careerTemplateRoutes.js';
import studyToolsRoutes from './routes/studyToolsRoutes.js';
import universalTicketRoutes from './routes/universalTicketRoutes.js';
import leadRoutes from './routes/leadRoutes.js';
import resumeBuilderRoutes from './routes/resumeBuilderRoutes.js';
import gameRoutes from './routes/gameRoutes.js';
import companionRoutes from './routes/companionRoutes.js';
import scholarshipRoutes from './routes/scholarshipRoutes.js';
import jobRoutes from './routes/jobRoutes.js';
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
app.use('/api/leads', leadRoutes);
app.use('/api/resume-builder', resumeBuilderRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/companion', companionRoutes);
app.use('/api/scholarships', scholarshipRoutes);
app.use('/api/jobs', jobRoutes);

// Error Handling Middleware
app.use((err, req, res, next) => {
    // Respect structured statusCode set by groqClient / geminiCompanion on 429 errors
    const statusCode = err.statusCode || (res.statusCode === 200 ? 500 : res.statusCode);
    res.status(statusCode);
    res.json({
        message: err.message,
        ...(err.retryAfter && { retryAfter: err.retryAfter }),
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
});

const PORT = process.env.PORT || 5001;

httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
