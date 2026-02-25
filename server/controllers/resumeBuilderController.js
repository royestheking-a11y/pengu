import asyncHandler from 'express-async-handler';
import { parseResumeText } from '../utils/groqResumeBuilder.js';

// @desc    Parse raw text into structured resume JSON
// @route   POST /api/resume-builder/generate
// @access  Private
export const generateResume = asyncHandler(async (req, res) => {
    const { rawText } = req.body;

    if (!rawText) {
        res.status(400);
        throw new Error('Please provide resume text to parse.');
    }

    try {
        const parsedResume = await parseResumeText(rawText);
        res.status(200).json(parsedResume);
    } catch (error) {
        console.error("Resume Generation Error:", error);
        res.status(500);
        throw new Error('Failed to parse resume text using AI.');
    }
});
