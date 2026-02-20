import { matchCareerToJob, upgradeBulletPoints, generateApplicationEmail } from '../utils/careerScanner.js';
import { groqAnalyzeMatch, groqOptimizeCV, groqGenerateEmail } from '../utils/geminiCareer.js';

// ─── Analyze Match ────────────────────────────────────────────────────────────
export const analyzeMatch = async (req, res) => {
    try {
        const { cvText, jdText } = req.body;
        if (!cvText || !jdText) {
            return res.status(400).json({ message: "CV text and Job Description are required" });
        }

        let analysis;
        let source = 'groq';

        try {
            console.log('[Career AI] Attempting Groq analysis...');
            analysis = await groqAnalyzeMatch(cvText, jdText);
            console.log('[Career AI] ✅ Groq analysis succeeded');
        } catch (groqError) {
            console.warn('[Career AI] ⚠️ Groq failed, using built-in fallback:', groqError.message);
            source = 'builtin';
            analysis = await matchCareerToJob(cvText, jdText);
        }

        res.json({ ...analysis, _source: source });
    } catch (error) {
        console.error("Match Analysis Error:", error);
        res.status(500).json({ message: "Internal Server Error during career match analysis" });
    }
};

// ─── Optimize CV ─────────────────────────────────────────────────────────────
export const optimizeCV = async (req, res) => {
    try {
        const { cvText } = req.body;
        if (!cvText) {
            return res.status(400).json({ message: "CV text is required" });
        }

        let result;
        let source = 'groq';

        try {
            console.log('[Career AI] Attempting Groq CV optimization...');
            result = await groqOptimizeCV(cvText);
            console.log('[Career AI] ✅ Groq optimization succeeded');
        } catch (groqError) {
            console.warn('[Career AI] ⚠️ Groq failed, using built-in fallback:', groqError.message);
            source = 'builtin';
            result = upgradeBulletPoints(cvText);
        }

        res.json({ ...result, _source: source });
    } catch (error) {
        console.error("CV Optimization Error:", error);
        res.status(500).json({ message: "Internal Server Error during CV optimization" });
    }
};

// ─── Generate Email ───────────────────────────────────────────────────────────
export const generateEmail = async (req, res) => {
    try {
        const { cvText, jdText, tone, length } = req.body;

        let email;
        let source = 'groq';

        try {
            console.log('[Career AI] Attempting Groq email generation...');
            email = await groqGenerateEmail(cvText, jdText, tone, length);
            console.log('[Career AI] ✅ Groq email generation succeeded');
        } catch (groqError) {
            console.warn('[Career AI] ⚠️ Groq failed, using built-in fallback:', groqError.message);
            source = 'builtin';
            email = generateApplicationEmail(cvText, jdText, tone, length);
        }

        res.json({ email, _source: source });
    } catch (error) {
        console.error("Email Generation Error:", error);
        res.status(500).json({ message: "Internal Server Error during email generation" });
    }
};
