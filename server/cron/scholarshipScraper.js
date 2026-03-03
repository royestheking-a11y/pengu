import cron from 'node-cron';
import axios from 'axios';
import * as cheerio from 'cheerio';
import groqManager from '../utils/groqClient.js';
import { verifyScholarshipWithGemini } from '../utils/geminiVerifier.js';
import Scholarship from '../models/scholarshipModel.js';
import connectDB from '../config/db.js';

// Global configurations for demo
const TARGET_URLS = [
    'https://www.scholars4dev.com/category/level-of-study/masters-scholarships/',
    // We can add more reliable directory URLs here
];

/**
 * Scrape raw text from a webpage using Cheerio.
 */
const scrapeWebpage = async (url) => {
    try {
        const { data } = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });
        const $ = cheerio.load(data);

        // Remove scripts, styles, and empty elements to save tokens
        $('script, style, noscript, iframe, img, svg').remove();

        // Extract links and text for Groq context
        let content = '';
        $('.post-wrapper, .entry-content, main, article').each((i, el) => {
            content += $(el).text() + '\n';
            // Specifically grab links inside the entry
            $(el).find('a').each((j, link) => {
                content += `LINK: ${$(link).attr('href')} TEXT: ${$(link).text()}\n`;
            });
        });

        // If specific selectors fail, just grab the body text
        if (!content.trim()) {
            content = $('body').text();
        }

        // Clean up excessive whitespace
        return content.replace(/\s+/g, ' ').slice(0, 15000); // Send max 15k chars to Groq
    } catch (error) {
        console.error(`[Scraper] Error fetching ${url}:`, error.message);
        return null;
    }
};

/**
 * Speed Parse with Groq to extract JSON scholarship data
 */
const parseWithGroq = async (rawText) => {
    const prompt = `
You are a highly efficient data extractor. 
I am going to provide you with raw HTML text scraped from a scholarship directory.
Find the top 3 most prominent active scholarships mentioned in this text.

For each scholarship, extract the following:
1. "title": The official name of the scholarship.
2. "country": The host country (if unlisted, infer from the university or say "Various").
3. "degreeLevel": E.g., "Bachelors", "Masters", "PhD", or "Multiple".
4. "fundingType": E.g., "Fully Funded", "Partial", "Tuition Only".
5. "deadline": The application deadline date. If not found, write "Check Official Site".
6. "exampleSopUrl": The official link/URL to the scholarship page found in the text.
7. "description": A 1-2 sentence summary of what the scholarship offers.

Return the output STRICTLY as a JSON array of objects. Do not include any markdown formatting, backticks, or conversational text. Output ONLY the JSON array.

RAW TEXT:
${rawText}
    `;

    try {
        const responseText = await groqManager.ask(prompt, {
            model: 'llama-3.3-70b-versatile', // Best for instruction following
            temperature: 0.1
        });

        const jsonMatch = responseText.match(/\[[\s\S]*\]/);
        const cleaned = jsonMatch ? jsonMatch[0] : responseText;
        return JSON.parse(cleaned);

    } catch (error) {
        console.error('[Groq Parser] Error parsing text:', error);
        return [];
    }
};

/**
 * Main Cron Job execution pipeline
 */
export const runNightShift = async () => {
    console.log('--- [THE NIGHT SHIFT] Starting Automated Scholarship Scraper ---');
    console.log(`Time: ${new Date().toISOString()}`);

    for (const url of TARGET_URLS) {
        console.log(`[1] Scraping: ${url}`);
        const rawText = await scrapeWebpage(url);

        if (!rawText) continue;

        console.log(`[DEBUG] Raw Text Length: ${rawText.length}`);

        console.log(`[2] Speed Parsing with Groq...`);
        const extractedScholarships = await parseWithGroq(rawText);
        console.log(`[Groq] Found ${extractedScholarships.length} potential scholarships.`);

        for (const scholarship of extractedScholarships) {
            console.log(`\n[3] Auditing: ${scholarship.title}`);
            const isVerified = await verifyScholarshipWithGemini(scholarship);

            if (isVerified) {
                console.log(`[4] Verification Passed. Checking if exists in DB...`);

                // Prevent duplicates based on title
                const exists = await Scholarship.findOne({ title: scholarship.title });

                if (!exists) {
                    console.log(`[5] Inserting into Draft Inbox...`);
                    await Scholarship.create({
                        title: scholarship.title,
                        country: scholarship.country,
                        degreeLevel: scholarship.degreeLevel,
                        fundingType: scholarship.fundingType,
                        deadline: scholarship.deadline,
                        description: scholarship.description,
                        exampleSopUrl: scholarship.exampleSopUrl, // using this field to store the official link
                        status: 'DRAFT',
                        baseFee: 0 // Admin will set this during review
                    });
                    console.log(`[SUCCESS] Draft created for ${scholarship.title}`);
                } else {
                    console.log(`[SKIPPED] Scholarship already exists in DB.`);
                }
            } else {
                console.log(`[REJECTED] Failed Gemini Verification Audit.`);
            }
        }
    }
    console.log('--- [THE NIGHT SHIFT] Run Complete ---');
};

// Schedule the task to run exactly at 2:00 AM every day
const setupCronJobs = () => {
    cron.schedule('0 2 * * *', () => {
        runNightShift();
    });
    console.log('[Night Shift] Cron job scheduled for 2:00 AM daily.');
};

export default setupCronJobs;
