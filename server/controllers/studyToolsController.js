import { generateQuiz, explainConcept, generateExamQuestions } from '../utils/groqStudyTools.js';

// ─── Quiz Generator ───────────────────────────────────────────────────────────
export const quizGenerator = async (req, res) => {
    try {
        const { topic, subject, difficulty = 'intermediate', count = 5 } = req.body;
        if (!topic || !subject) {
            return res.status(400).json({ message: 'Topic and subject are required' });
        }
        const safeCount = Math.min(Math.max(parseInt(count) || 5, 3), 10);
        console.log(`[Study AI] Generating ${safeCount} quiz questions on "${topic}"...`);
        const result = await generateQuiz(topic, subject, difficulty, safeCount);
        res.json(result);
    } catch (error) {
        console.error('[Study AI] Quiz generation error:', error.message);
        res.status(500).json({ message: 'Failed to generate quiz. Please try again.' });
    }
};

// ─── Concept Explainer ────────────────────────────────────────────────────────
export const conceptExplainer = async (req, res) => {
    try {
        const { topic, subject, level = 'beginner' } = req.body;
        if (!topic || !subject) {
            return res.status(400).json({ message: 'Topic and subject are required' });
        }
        console.log(`[Study AI] Explaining "${topic}" at ${level} level...`);
        const result = await explainConcept(topic, subject, level);
        res.json(result);
    } catch (error) {
        console.error('[Study AI] Concept explainer error:', error.message);
        res.status(500).json({ message: 'Failed to explain concept. Please try again.' });
    }
};

// ─── Exam Prep ────────────────────────────────────────────────────────────────
export const examPrepGenerator = async (req, res) => {
    try {
        const { topic, subject, examType = 'past-paper', count = 5 } = req.body;
        if (!topic || !subject) {
            return res.status(400).json({ message: 'Topic and subject are required' });
        }
        const safeCount = Math.min(Math.max(parseInt(count) || 5, 2), 8);
        console.log(`[Study AI] Generating ${safeCount} ${examType} questions on "${topic}"...`);
        const result = await generateExamQuestions(topic, subject, examType, safeCount);
        res.json(result);
    } catch (error) {
        console.error('[Study AI] Exam prep error:', error.message);
        res.status(500).json({ message: 'Failed to generate exam questions. Please try again.' });
    }
};
