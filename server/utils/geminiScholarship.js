import axios from 'axios';

const GEMINI_API_KEYS = [
    process.env.GEMINI_API_KEY_1,
    process.env.GEMINI_API_KEY_2
].filter(Boolean);

let currentKeyIndex = 0;

const getNextKey = () => {
    if (GEMINI_API_KEYS.length === 0) {
        throw new Error("No Gemini API keys found in environment variables.");
    }
    const key = GEMINI_API_KEYS[currentKeyIndex];
    currentKeyIndex = (currentKeyIndex + 1) % GEMINI_API_KEYS.length;
    return key;
};

/**
 * Call the Gemini API to generate a draft of a real-world scholarship.
 */
export const generateScholarshipDraft = async () => {
    const systemPrompt = `You are an expert educational researcher specializing in international scholarships.
Your task is to find one real, currently open or recently announced international scholarship.
You must return the scholarship details as a STRICT JSON object matching exactly this schema, and nothing else (no markdown formatting, no code blocks, just raw JSON).

Required JSON format:
{
  "title": "String - Official name of the scholarship",
  "universityName": "String - Name of the host university or organization",
  "country": "String - Host country",
  "deadline": "YYYY-MM-DD - The application deadline. If not exact, guess the closest realistic future date.",
  "scholarshipType": ["String"] - Array containing any subset of: "Fully Funded", "Tuition Only", "Monthly Stipend", "Accommodation", "Airfare",
  "degreeLevel": ["String"] - Array containing any subset of: "Bachelors", "Masters", "PhD", "Postdoc", "Diploma",
  "fundingType": "String - Either 'Fully Funded' or 'Partial'",
  "minCgpa": Number - Minimum required CGPA out of 4.0. Usually around 3.0 to 3.5.,
  "minIelts": Number - Minimum required IELTS score. Usually 6.0 to 7.0.,
  "description": "String - A short, 2-3 sentence summary of the scholarship.",
  "richTextDescription": "String - A detailed HTML formatted description including Eligibility, Benefits, and Required Documents. Use <h3>, <ul>, <li>, <p> tags.",
  "baseFee": Number - A default processing fee the platform charges to apply for it. Pick a number between 5000 and 25000.,
  "expertApplicationFee": Number - A fee for expert drafting. Pick a number between 10000 and 50000.
}

Do NOT wrap the JSON in \`\`\`json ... \`\`\`. Output ONLY the raw JSON string. Ensure the JSON is completely valid.`;

    const payload = {
        contents: [
            {
                role: 'user',
                parts: [{ text: "Please generate a fresh, real scholarship draft." }]
            }
        ],
        system_instruction: {
            parts: { text: systemPrompt }
        },
        generationConfig: {
            temperature: 0.9, // Higher temp to ensure variety
            maxOutputTokens: 2000,
        }
    };

    let attempts = 0;
    while (attempts < GEMINI_API_KEYS.length) {
        const key = getNextKey();
        try {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`;
            const response = await axios.post(url, payload, {
                headers: { 'Content-Type': 'application/json' }
            });

            const replyText = response.data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (replyText) {
                try {
                    // Try to parse it to ensure Gemini actually obeyed the JSON format command
                    const parsed = JSON.parse(replyText.trim().replace(/^```json/, '').replace(/```$/, '').trim());
                    return parsed;
                } catch (parseError) {
                    console.error("Failed to parse Gemini scholarship JSON:", parseError);
                    console.error("Raw response:", replyText);
                    throw new Error("Gemini returned invalid JSON format.");
                }
            } else {
                throw new Error("Invalid response format from Gemini");
            }
        } catch (error) {
            console.error(`Gemini API error with key ending in ${key.slice(-4)}:`, error.response?.data || error.message);
            attempts++;
            if (attempts >= GEMINI_API_KEYS.length) {
                throw new Error("All Gemini API keys failed.");
            }
            console.log("Retrying with next Gemini key...");
        }
    }
};
