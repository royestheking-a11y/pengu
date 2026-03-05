import Groq from 'groq-sdk';

class GroqManager {
    constructor() {
        // 1. Check for comma-separated list
        let keys = (process.env.GROQ_API_KEYS || process.env.GROQ_API_KEY || '').split(',').filter(Boolean);

        // 2. If no list, or to supplement the list, check for numbered keys (GROQ_API_KEY_1, GROQ_API_KEY_2, etc.)
        // Render often prefers individual variables
        for (let i = 1; i <= 5; i++) {
            const key = process.env[`GROQ_API_KEY_${i}`];
            if (key && !keys.includes(key)) {
                keys.push(key);
            }
        }

        this.keys = keys;
        this.currentIndex = 0;
        this.clients = this.keys.map(key => new Groq({ apiKey: key }));

        if (this.clients.length === 0) {
            console.warn('[GroqManager] No API keys found in GROQ_API_KEYS or GROQ_API_KEY');
        } else {
            console.log(`[GroqManager] Initialized with ${this.clients.length} keys`);
        }
    }

    getClient() {
        if (this.clients.length === 0) throw new Error('No Groq API keys configured');
        const client = this.clients[this.currentIndex];
        // Round robin for next time
        this.currentIndex = (this.currentIndex + 1) % this.clients.length;
        return client;
    }

    async createChatCompletion(options) {
        const MAX_ROUNDS = 3;
        const BACKOFF_MS = [500, 1000, 2000]; // Exponential backoff delays

        for (let round = 0; round < MAX_ROUNDS; round++) {
            let allRateLimited = true;

            for (let i = 0; i < this.clients.length; i++) {
                const client = this.getClient();
                try {
                    return await client.chat.completions.create(options);
                } catch (error) {
                    const keyIdx = (this.currentIndex - 1 + this.clients.length) % this.clients.length;
                    console.error(`[GroqManager] Error with key index ${keyIdx}:`, error.message);

                    if (error.status === 429 || error.status >= 500) {
                        console.log('[GroqManager] Retrying with next available key...');
                        continue;
                    }
                    // Non-retryable error — throw immediately
                    allRateLimited = false;
                    throw error;
                }
            }

            if (allRateLimited && round < MAX_ROUNDS - 1) {
                const delay = BACKOFF_MS[round];
                console.warn(`[GroqManager] All keys rate-limited. Waiting ${delay}ms before retry round ${round + 2}/${MAX_ROUNDS}...`);
                await new Promise(res => setTimeout(res, delay));
            }
        }

        // All retries exhausted — surface a structured 429 to the route handler
        const friendlyError = new Error('Pengu AI is busy right now — please wait a moment and try again.');
        friendlyError.statusCode = 429;
        friendlyError.retryAfter = 30;
        throw friendlyError;
    }

    async ask(prompt, options = {}) {
        const { model = 'llama-3.1-8b-instant', maxTokens = 2000, temperature = 0.4 } = options;
        const response = await this.createChatCompletion({
            model,
            messages: [{ role: 'user', content: prompt }],
            max_tokens: maxTokens,
            temperature
        });
        return response.choices[0].message.content.trim();
    }
}

const groqManager = new GroqManager();
export default groqManager;
