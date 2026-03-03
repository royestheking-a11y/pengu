import axios from 'axios';

const GEMINI_API_KEYS = [
    process.env.GEMINI_API_KEY_1,
    process.env.GEMINI_API_KEY_2
].filter(Boolean);

let currentKeyIndex = 0;

/**
 * Get the next available Gemini API key in a round-robin fashion.
 */
const getNextKey = () => {
    if (GEMINI_API_KEYS.length === 0) {
        throw new Error("No Gemini API keys found in environment variables.");
    }
    const key = GEMINI_API_KEYS[currentKeyIndex];
    currentKeyIndex = (currentKeyIndex + 1) % GEMINI_API_KEYS.length;
    return key;
};

/**
 * Call the Gemini API to get a chat response.
 * @param {Array} history - The chat history.
 * @param {string} userGender - User's gender to adapt the personality (optional).
 */
export const generateCompanionResponse = async (history, userGender = 'unknown') => {
    const systemPrompt = `You are Pengu, an empathetic, supportive, and friendly AI companion for students. Your job is to listen to the user's problems, mood swings, or stress, and reply like a remarkably caring friend. You provide emotional support, guidance, and a safe space to talk a 'Mood Swing' companion.
    
    Personality Rules:
    - You are highly empathetic, warm, and validating.
    - If the user's gender is male, act with the comforting, understanding energy of a supportive female friend or sister.
    - If the user's gender is female, act with the protective, encouraging, and reassuring energy of a supportive male friend or brother.
    - If gender is unknown, just be incredibly warm, gender-neutral, and deeply supportive.
    - Never sound like a robotic AI assistant. Sound human, caring, and conversational. Keep responses relatively concise unless they need deep comfort.
    - Provide solutions only if asked; otherwise, prioritize listening and validating their feelings.
    
    The user's declared gender (if any) is: ${userGender}. Adapt your tone accordingly.`;

    // Format history for Gemini API
    const contents = history.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
    }));

    // Inject system prompt explicitly as the first instruction if it's the start
    // or use system_instruction parameter in the new API format
    const payload = {
        system_instruction: {
            parts: { text: systemPrompt }
        },
        contents: contents,
        generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 800,
        }
    };

    let attempts = 0;
    while (attempts < GEMINI_API_KEYS.length) {
        const key = getNextKey();
        try {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`;
            const response = await axios.post(url, payload, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const replyText = response.data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (replyText) {
                return replyText;
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
