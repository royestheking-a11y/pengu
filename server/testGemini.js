import 'dotenv/config';
import mongoose from 'mongoose';
import { generateScholarshipDraft } from './utils/geminiScholarship.js';

async function testGemini() {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(process.env.MONGO_URI);

        console.log("Requesting scholarship draft from Gemini...");
        const draft = await generateScholarshipDraft();
        console.log("Success! Received Draft:");
        console.log(JSON.stringify(draft, null, 2));

    } catch (error) {
        console.error("Test failed:", error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

testGemini();
