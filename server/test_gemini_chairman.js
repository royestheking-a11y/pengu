import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });

async function testGemini() {
    console.log("🧪 [TEST] Initializing Gemini API Check...");
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        console.error("❌ GEMINI_API_KEY not found in .env");
        process.exit(1);
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-3.1-pro-preview" });

        console.log("📡 [TEST] Sending request to Gemini 3.1 Pro Preview...");
        const result = await model.generateContent("Respond with 'Gemini is Active' if you receive this.");
        const text = result.response.text();

        console.log("✅ [TEST] Success! Response:", text);

        if (text.includes("Gemini is Active")) {
            console.log("✨ [TEST] Final Confirmation: Chairman AI System is GO.");
        } else {
            console.warn("⚠️ [TEST] Gemini responded, but the output was unexpected.");
        }
    } catch (error) {
        console.error("❌ [TEST] Gemini API Error:", error.message);
    }
}

testGemini();
