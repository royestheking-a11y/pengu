import Groq from "groq-sdk";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });

async function testGroq() {
    console.log("🧪 [TEST] Initializing Groq API Check...");
    const apiKey = (process.env.GROQ_API_KEYS || "").split(',')[0];

    if (!apiKey) {
        console.error("❌ GROQ_API_KEYS not found in .env");
        process.exit(1);
    }

    try {
        const groq = new Groq({ apiKey });

        console.log("📡 [TEST] Sending request to Groq (Llama 3)...");
        const completion = await groq.chat.completions.create({
            messages: [{ role: "user", content: "Respond with 'Groq is Active' if you receive this." }],
            model: "llama-3.1-8b-instant",
        });

        const text = completion.choices[0].message.content;
        console.log("✅ [TEST] Success! Response:", text);

        if (text.includes("Groq is Active")) {
            console.log("✨ [TEST] Final Confirmation: Chairman Agent is GO on Groq.");
        }
    } catch (error) {
        console.error("❌ [TEST] Groq API Error:", error.message);
    }
}

testGroq();
