import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

function logErrorSync(msg) {
    fs.writeSync(2, `--- [DB_ERROR] ${msg}\n`);
}

const connectDB = async () => {
    try {
        if (!process.env.MONGO_URI) {
            logErrorSync('MONGO_URI is not defined in environment variables');
            return;
        }
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        logErrorSync(`Connection Failed: ${error.message}`);
        // Remove process.exit(1) to allow the server to start and show logs
    }
};

export default connectDB;
