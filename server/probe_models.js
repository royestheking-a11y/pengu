import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });

async function listModels() {
    console.log("📡 [DIAGNOSTIC] Listing Available Gemini Models...");
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        console.error("❌ GEMINI_API_KEY not found in .env");
        process.exit(1);
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        // We use the underlying fetch or a dummy model to see if we can at least connect
        // But the SDK doesn't have a direct 'listModels' helper in the simple GenAI class
        // Let's try to just probe the common variants.

        const modelsToProbe = [
            "gemini-1.5-pro-latest",
            "gemini-1.5-pro",
            "gemini-1.5-flash",
            "gemini-pro"
        ];

        for (const modelId of modelsToProbe) {
            try {
                const model = genAI.getGenerativeModel({ model: modelId });
                console.log(`🔍 Probing ${modelId}...`);
                const result = await model.generateContent("test");
                console.log(`✅ ${modelId} is AVAILABLE.`);
            } catch (e) {
                console.log(`❌ ${modelId} FAILED: ${e.message}`);
            }
        }

    } catch (error) {
        console.error("❌ Diagnostic Error:", error.message);
    }
}

listModels();
