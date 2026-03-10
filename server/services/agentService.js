import Groq from "groq-sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { userProfile } from "../config/userProfile.js";
import Job from "../models/jobModel.js";
import cloudinary from "cloudinary";

import dotenv from "dotenv";
dotenv.config();

// Initialize APIs
console.log(`🔑 [AGENT SERVICE] Initializing with Groq Key exists: ${!!process.env.GROQ_API_KEYS}`);
const groq = new Groq({ apiKey: (process.env.GROQ_API_KEYS || "").split(',')[0] });
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Helper to extract JSON from AI response strings
const extractJson = (text) => {
    try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        return JSON.parse(text);
    } catch (error) {
        console.error("JSON Parse Error. Raw Text:", text);
        throw new Error("Failed to parse AI response as JSON");
    }
};

/**
 * Robust wrapper for AI calls with retry logic and provider fallback.
 * @param {Object} options - { prompt, systemPrompt, model, responseFormat, providerPreference }
 */
async function callAIAgent({ prompt, systemPrompt = "", model = "llama-3.3-70b-versatile", responseFormat = "json_object", providerPreference = "groq" }) {
    let retries = 0;
    const maxRetries = 2;
    const delay = (ms) => new Promise(res => setTimeout(res, ms));

    while (retries <= maxRetries) {
        try {
            if (providerPreference === "groq") {
                console.log(`🤖 [AI CALL] Using Groq (${model})... (Attempt ${retries + 1})`);
                const completion = await groq.chat.completions.create({
                    messages: [
                        { role: "system", content: systemPrompt || "You are a helpful AI assistant." },
                        { role: "user", content: prompt }
                    ],
                    model: model,
                    response_format: responseFormat === "json_object" ? { type: "json_object" } : undefined
                });
                return extractJson(completion.choices[0].message.content);
            } else {
                console.log(`🤖 [AI CALL] Using Gemini 1.5 Flash... (Attempt ${retries + 1})`);
                const geminiModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
                const result = await geminiModel.generateContent(systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt);
                return extractJson(result.response.text());
            }
        } catch (error) {
            const isRateLimit = error.message?.includes("429") || error.status === 429;
            const isJsonError = error.message?.includes("json_validate_failed") || error.message?.includes("JSON");

            console.error(`⚠️ [AI CALL] Attempt ${retries + 1} failed: ${error.message}`);

            if (isRateLimit && providerPreference === "groq") {
                console.warn("🔄 [AI CALL] Groq Rate Limit hit. Falling back to Gemini...");
                providerPreference = "gemini";
                continue; // Retry immediately with Gemini
            }

            if (retries < maxRetries) {
                retries++;
                const waitTime = Math.pow(2, retries) * 1000;
                console.log(`⏳ [AI CALL] Retrying in ${waitTime}ms...`);
                await delay(waitTime);
            } else {
                throw error;
            }
        }
    }
}

export const processJobAgents = async (jobId) => {
    console.log(`\n========================================`);
    console.log(`🤖 [AGENT CHAIN] TRIGGERED for Job: ${jobId}`);
    console.log(`========================================`);
    const job = await Job.findById(jobId);
    if (!job) {
        console.error("❌ Job not found in database:", jobId);
        return;
    }

    try {
        // --- Agent 0: Data Refiner (Sanitize Inputs) ---
        console.log("➡️ [DATA REFINER] Checking for placeholders...");
        if (job.company === "Extracted Company" || job.company === "Demo Corp") {
            const extracted = await extractMetadataByAI(job);
            if (extracted.company && extracted.company !== "Extracted Company") {
                job.company = extracted.company;
                console.log(`✅ [DATA REFINER] Extracted real company: ${job.company}`);
            }
        }
        await updateJobStatus(job, 'analyzing', 'CEO', 20);

        // --- Agent 2: CEO (Strategic Fit) ---
        console.log("➡️ [CEO] Analyzing strategic fit...");
        const ceoAnalysis = await runCEOAnalysis(job);
        job.aiAnalysis.ceo = ceoAnalysis;
        console.log("✅ [CEO] Analysis complete. Fit:", ceoAnalysis.isFit);
        await updateJobStatus(job, 'analyzing', 'PENGURI', 40);

        // --- Agent 3: Penguri (ATS Gatekeeper) ---
        console.log("➡️ [PENGURI] Running ATS Match Simulation...");
        const atsResult = await runPenguriAnalysis(job);
        job.atsScore = atsResult.score;
        job.shortlistChance = atsResult.shortlistChance;
        job.aiAnalysis.penguri = atsResult.details;
        console.log(`✅ [PENGURI] ATS Match: ${job.atsScore}%, Shortlist: ${job.shortlistChance}%`);

        if (job.atsScore < 70) {
            console.warn("⚠️ [PENGURI] Score below threshold (70). Rejecting job.");
            await updateJobStatus(job, 'rejected', 'idle', 100);
            return;
        }
        await updateJobStatus(job, 'generating_materials', 'RUBI', 60);

        // --- Agent 4: Rubi (Premium CV Tailor) ---
        console.log("➡️ [RUBI] Generating Full Tailored CV...");
        const tailoredCv = await runRubiGenerator(job);
        job.tailoredCvData = tailoredCv;
        job.tailoredCvHighlights = tailoredCv.highlights || [];
        console.log("✅ [RUBI] CV tailoring complete.");
        await updateJobStatus(job, 'generating_materials', 'PANDU', 80);

        // --- Agent 5: Pandu (Premium Pitch Writer) ---
        console.log("➡️ [PANDU] Writing premium pitch materials...");
        const materials = await runPanduGenerator(job);
        job.draftedEmail = materials.email;
        job.aiAnalysis.coverLetter = materials.coverLetter;
        console.log("✅ [PANDU] Premium pitch materials generated.");
        await updateJobStatus(job, 'awaiting_approval', 'CHAIRMAN', 92);

        // --- Agent 6: Chairman (Final Review) ---
        console.log("➡️ [CHAIRMAN] Running final AI review...");
        const chairmanReview = await runChairmanReview(job);
        job.aiAnalysis.chairman = chairmanReview;

        if (chairmanReview.approved) {
            console.log("🚀 [CHAIRMAN] Approved! Preparing interview kit...");
            try {
                const interviewKit = await runInterviewPrepAgent(job);
                job.aiAnalysis.interviewPrep = interviewKit;
                job.status = 'interview_ready';
                console.log(`✅ [RuBI HR] Interview kit generated with ${interviewKit.length} questions.`);
            } catch (prepError) {
                console.warn("⚠️ [RuBI HR] Interview prep failed.", prepError.message);
                job.status = 'sent';
                await updateJobStatus(job, 'sent', 'idle', 100);
            }
        } else {
            console.warn("🛑 [CHAIRMAN] rejected or needs fix. Stopping chain.");
        }

        await updateJobStatus(job, job.status, 'idle', 100);
        console.log(`🎯 [AGENT CHAIN] Success. Final Status: ${job.status}`);

    } catch (error) {
        console.error("❌ [AGENT CHAIN] FATAL ERROR CAUGHT:");
        console.error("Message:", error.message);
        job.status = 'failed';
        job.aiAnalysis = { ...job.aiAnalysis, error: error.message };
        job.markModified('aiAnalysis');
        await job.save();
        console.log("💾 [AGENT CHAIN] Failure status saved to DB.");
    }
};

async function updateJobStatus(job, status, agent, progress) {
    job.status = status;
    job.activeAgent = agent;
    job.progress = progress;
    job.markModified('aiAnalysis');
    await job.save();
}

async function runCEOAnalysis(job) {
    const prompt = `Analyze if this job is a strategic fit for ${userProfile.name} (${userProfile.title}). 
    Job: ${job.role} at ${job.company}. 
    Description: ${job.description.substring(0, 3000)}
    User Experience: ${JSON.stringify(userProfile.experience)}
    Respond in JSON format: { "isFit": boolean, "reason": string }`;

    return await callAIAgent({ prompt, systemPrompt: "You are a CEO-level AI assistant filtering high-end job matches.", model: "llama-3.1-8b-instant" });
}

async function runPenguriAnalysis(job) {
    const prompt = `As PENGURI (ATS Specialist), check the match rate for this job.
    Job Requirements: ${job.description.substring(0, 3000)}
    User CV Profile: ${JSON.stringify(userProfile)}
    Return strictly as a JSON object: { "score": number (0-100), "shortlistChance": number (0-100), "details": "Brief analysis" }`;

    return await callAIAgent({ prompt, model: "llama-3.3-70b-versatile" });
}

async function runRubiGenerator(job) {
    const prompt = `As RUBI (Premium CV Architect), create a high-end tailored CV.
    Target Job: ${job.role} at ${job.company}
    JD: ${job.description.substring(0, 3000)}
    User Profile: ${JSON.stringify(userProfile)}
    
    Return strictly as a JSON object: {
      "summary": "string",
      "experience": [{ "role": "string", "company": "string", "period": "string", "points": ["string"] }],
      "skills": { "technical": ["string"], "soft": ["string"], "languages": ["string"] },
      "highlights": ["string"]
    }`;

    return await callAIAgent({ prompt, model: "llama-3.3-70b-versatile" });
}

async function runPanduGenerator(job) {
    const prompt = `Write a MASTERFUL Application Email and a Sophisticated Cover Letter for ${userProfile.name}.
    Target Job: ${job.role} at ${job.company}
    Profile: ${JSON.stringify(userProfile)}
    
    Return strictly as a JSON object: { 
      "coverLetter": "Body text starting DIRECTLY with 'Dear'...", 
      "email": "Email starting with 'Dear'. End with professional signature." 
    }`;

    const systemPrompt = `You are PANDU (Elite Executive Copywriter). STYLE: Olivia Wilson (Elegant, Minimalist). 
    CRITICAL: NO placeholders. Use "${job.company}". END email with a full signature block including website and social links.
    MANDATORY JSON FORMAT. Do not include any text outside the JSON object.`;

    const data = await callAIAgent({ prompt, systemPrompt, model: "llama-3.3-70b-versatile" });
    return {
        coverLetter: cleanAIText(data.coverLetter, job.company),
        email: cleanAIText(data.email, job.company)
    };
}

async function extractMetadataByAI(job) {
    const prompt = `Extract Company, Role, and Email. 
    URL: ${job.url}
    Description: ${job.description.substring(0, 2000)}
    Return strictly JSON: { "company": "string", "role": "string", "email": "string or null" }`;

    const result = await callAIAgent({ prompt, model: "llama-3.1-8b-instant" });
    if (result.email) job.targetEmail = result.email;
    return result;
}

export const runChairmanReview = async (job) => {
    const prompt = `As THE CHAIRMAN, review this application for ${job.role} at ${job.company}.
    Email: ${job.draftedEmail}
    CV Summary: ${job.tailoredCvData?.summary}
    Return JSON: { "approved": boolean, "feedback": "string", "status": "ready" | "needs_fix" }`;

    return await callAIAgent({ prompt, model: "llama-3.1-8b-instant" });
};

function cleanAIText(text, companyName = "") {
    if (!text) return "";

    // 1. Find the first occurrence of "Dear" or "Hi" and strip everything before it
    const salutationIndex = text.search(/^(?:Dear|Hi)\s/im);
    let cleaned = salutationIndex !== -1 ? text.substring(salutationIndex) : text;

    // 2. Initial cleanup of common AI labels and metadata headers
    cleaned = cleaned
        .replace(/^(?:Email Body|Subject|Cover Letter Body|Email|Cover Letter|Mail Number|To|From):\s*/gim, "")
        .replace(/^Subject:.*$/gim, "")
        .trim();

    // 3. Remove specific redundant headers
    const headerPatterns = [
        /^AURANGZEB SUNNY$/im,
        /^Nikunja 2, Dhaka.*$/im,
        /^aurangzebsunnyy@gmail\.com.*$/im,
        /^\+8801625691878.*$/im,
        /^linkedin\.com\/in\/aurangzeb-sunny-a00930336\/.*$/im,
        /^aurangzebsunnyy\.vercel\.app.*$/im
    ];

    headerPatterns.forEach(p => {
        cleaned = cleaned.replace(p, "").trim();
    });

    // 4. AGGRESSIVE SIGNATURE STRIPPING
    const signatureStartPatterns = [
        /(?:Sincerely|Best Regards|Thank you|Respectfully|Yours sincerely|Kind regards|Best|Regards|Yours faithfully|Truly|Warmly|Kindly),?\s*(?:Aurangzeb|Sunny|sunny).*$/is,
        /(?:Sincerely|Best Regards|Thank you|Respectfully|Yours sincerely|Kind regards|Best|Regards|Yours faithfully|Truly|Warmly|Kindly),?\s*$/im
    ];

    signatureStartPatterns.forEach(p => {
        cleaned = cleaned.replace(p, "").trim();
    });

    // 5. Remove standalone name if it appears at the very end
    cleaned = cleaned.replace(/(?:AURANGZEB SUNNY|Aurangzeb Sunny|Sunny|sunny)\s*$/gi, "").trim();

    return cleaned;
}

export const runInterviewPrepAgent = async (job) => {
    const prompt = `Generate a 20-question high-end interview kit for ${userProfile.name} at ${job.company}.
    JD: ${job.description.substring(0, 3000)}
    Return strictly JSON: { "questions": [{ "question": "string", "options": ["string"], "correctAnswer": "string", "explanation": "string" }] }`;

    const data = await callAIAgent({ prompt, model: "llama-3.3-70b-versatile" });
    if (!data.questions || !Array.isArray(data.questions)) throw new Error("Invalid question format");
    return data.questions;
};
