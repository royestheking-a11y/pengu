
import Skill from '../models/skillModel.js';
import createCRUDRoutes from './crudController.js';
import { extractText } from '../utils/textExtractor.js';
import { analyzeSkills } from '../utils/skillScanner.js';
import asyncHandler from 'express-async-handler';

// Re-use standard CRUD
const textCrud = createCRUDRoutes(Skill);

// Custom method for scanning
const scan = asyncHandler(async (req, res) => {
    if (!req.file) {
        res.status(400);
        throw new Error('No file uploaded');
    }

    console.log(`[SkillController] Received file scan request`);
    console.log(`[SkillController] File Details:`, {
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        path: req.file.path
    });

    try {
        const text = await extractText(req.file);

        if (!text || text.length < 50) {
            res.status(400).json({ message: 'Extracted text is too short or empty. Please use a text-readable PDF/DOCX.' });
            return;
        }

        const skills = analyzeSkills(text);

        // Enhance skills with userId and save them immediately?
        // Logic in frontend was: receive skills, then loop to add them.
        // Better: Return the suggested skills, let frontend confirm? 
        // Frontend logic: "newSkills.forEach(addSkill);"
        // So I should return the array of skill objects.

        const enhancedSkills = skills.map(s => ({
            ...s,
            userId: req.user._id,
            date: new Date().toISOString()
        }));

        console.log(`[SkillController] Scan success. Found ${enhancedSkills.length} skills.`);
        res.json(enhancedSkills);

    } catch (error) {
        console.error('[SkillController] Scan Failed:', error);
        // Extract useful message
        const message = error.message.includes('fetch') ? 'Could not access uploaded file.' :
            error.message.includes('PDF') ? 'Could not read PDF contents.' :
                error.message;

        res.status(500).json({
            message: `Skill analysis failed: ${message}`,
            debug: error.message
        });
    }
});


const getMySkills = asyncHandler(async (req, res) => {
    const skills = await Skill.find({ userId: req.user._id });
    res.json(skills);
});

export const getAll = textCrud.getAll;
export const getById = textCrud.getById;
export const create = textCrud.create;
export const update = textCrud.update;
export const remove = textCrud.remove;

export {
    scan,
    getMySkills
};
