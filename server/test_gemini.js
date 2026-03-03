import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const testGemini = async () => {
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY_1;
    if (!GEMINI_API_KEY) {
        console.error("No API key");
        return;
    }

    const payload = {
        system_instruction: {
            parts: { text: "You are a friendly bot." }
        },
        contents: [{ role: 'user', parts: [{ text: "Hello" }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 800 }
    };

    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
        const res = await axios.post(url, payload, { headers: { 'Content-Type': 'application/json' } });
        console.log("Success:", res.data.candidates[0].content.parts[0].text);
    } catch (error) {
        console.error("Error from exact prod payload:", error.response?.data || error.message);
    }

    // Try array parts
    const payload2 = {
        system_instruction: {
            parts: [{ text: "You are a friendly bot." }]
        },
        contents: [{ role: 'user', parts: [{ text: "Hello" }] }],
    };

    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
        const res = await axios.post(url, payload2, { headers: { 'Content-Type': 'application/json' } });
        console.log("Success Array:", res.data.candidates[0].content.parts[0].text);
    } catch (error) {
        console.error("Error from array payload:", error.response?.data || error.message);
    }
};

testGemini();
