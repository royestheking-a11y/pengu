
import SyllabusEvent from '../models/syllabusModel.js';
import createCRUDRoutes from './crudController.js';
import { scanSyllabus } from '../utils/syllabusScanner.js';
import asyncHandler from 'express-async-handler';

// Re-use standard CRUD
const textCrud = createCRUDRoutes(SyllabusEvent);

// Custom method for scanning
const scan = asyncHandler(async (req, res) => {
    if (!req.file) {
        res.status(400);
        throw new Error('No file uploaded');
    }

    console.log(`[SyllabusController] Scanning file: ${req.file.originalname}`);

    try {
        const events = await scanSyllabus(req.file);

        if (!events || events.length === 0) {
            res.status(200).json({
                message: 'No deadlines detected. Try a clearer PDF or manual entry.',
                events: []
            });
            return;
        }

        // Enhance events with userId (do not save yet, let frontend confirm?)
        // SkillTwin just returns them. Let's do the same.
        // Frontend will decide to save them (addSyllabusEvent).

        const enhancedEvents = events.map((e, index) => ({
            ...e,
            id: `temp-${Date.now()}-${index}`, // Temp ID for frontend key
            userId: req.user._id
        }));

        console.log(`[SyllabusController] Scan success. Found ${enhancedEvents.length} events.`);
        res.json(enhancedEvents);

    } catch (error) {
        console.error('[SyllabusController] Scan Failed:', error);
        res.status(500).json({
            message: `Syllabus analysis failed: ${error.message}`,
            debug: error.message
        });
    }
});

// Override getAll to filter by userId
const getMyEvents = asyncHandler(async (req, res) => {
    const events = await SyllabusEvent.find({ userId: req.user._id });
    res.json(events);
});

export const getAll = textCrud.getAll;
export const getById = textCrud.getById;
export const create = textCrud.create;
export const update = textCrud.update;
export const remove = textCrud.remove;

export {
    scan,
    getMyEvents
};
