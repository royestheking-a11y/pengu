import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, 'server', '.env') });

import connectDB from './server/config/db.js';
import { runNightShift } from './server/cron/scholarshipScraper.js';

const testRun = async () => {
    try {
        await connectDB();
        await runNightShift();
        console.log('Test Run Complete.');
        process.exit(0);
    } catch (err) {
        console.error('Fatal Error:', err);
        process.exit(1);
    }
};

testRun();
