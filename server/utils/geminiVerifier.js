import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

let aiInstance = null;
let aiInitialized = false;

const getAI = () => {
    if (aiInitialized) return aiInstance;

    const apiKey = process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY_1 || process.env.GEMINI_API_KEY_2;
    if (!apiKey) {
        console.warn('[Gemini Auditor] No Gemini API key found. Verifier might fail.');
    }

    aiInstance = apiKey ? new GoogleGenAI({ apiKey }) : null;
    aiInitialized = true;
    return aiInstance;
};

/**
 * Uses Gemini Pro to verify the parsed scholarship data.
 * @param {Object} parsedData Data from Groq (title, country, degreeLevel, deadline, url)
 * @returns {Promise<boolean>} True if verification passes, False otherwise.
 */
export const verifyScholarshipWithGemini = async (parsedData) => {
    try {
        const prompt = `
You are an expert scholarship auditor. Your job is to verify fact-check a scholarship.

Scholarship Name: ${parsedData.title}
Country: ${parsedData.country}
Target Deadline: ${parsedData.deadline}

Please search the live internet or use your extensive knowledge base to verify the official deadline and eligibility requirements for this specific scholarship. 

Please search the live internet or use your extensive knowledge base to verify the official deadline and eligibility requirements for this specific scholarship. 

Respond ONLY with a JSON object in the following format:
{
    "verified": boolean,
    "reasoning": "A brief 1 sentence explanation of why it was verified or rejected.",
    "correctedDeadline": "The actual deadline if the target deadline is wrong, or null if correct/unverifiable."
}

Only return the JSON. No Markdown formatting. No backticks.
`;
        const ai = getAI();
        if (!ai) {
            console.warn('[Gemini Auditor] Verification skipped due to missing API key.');
            return false;
        }

        // We use gemini-2.5-flash as the fast verification engine since 1.5 Pro might be slower for cron jobs.
        // We can use gemini-2.5-pro if higher accuracy is needed, but flash is excellent for this.
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                temperature: 0.1, // We want factual, deterministic output
            }
        });

        const text = response.text;

        // Clean JSON formatting if Gemini added it
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        const cleaned = jsonMatch ? jsonMatch[0] : text;

        const result = JSON.parse(cleaned);

        console.log(`[Gemini Auditor] Verified: ${result.verified} | Reason: ${result.reasoning}`);

        // If Gemini finds a correction, we might want to update the parsed data before returning
        if (result.verified && result.correctedDeadline) {
            parsedData.deadline = result.correctedDeadline;
        }

        return result.verified;

    } catch (error) {
        console.error('[Gemini Auditor] Error veryifying scholarship:', error);
        // Fail open or fail closed? We fail closed (false) to prevent bad data in the CRM.
        return false;
    }
};
