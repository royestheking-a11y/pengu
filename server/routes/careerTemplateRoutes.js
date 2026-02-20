
import express from 'express';
const router = express.Router();
import { saveTemplate, getTemplates, deleteTemplate } from '../controllers/careerAnalysisTemplateController.js';
import { protect } from '../middleware/authMiddleware.js';

router.route('/')
    .post(protect, saveTemplate)
    .get(protect, getTemplates);

router.route('/:id')
    .delete(protect, deleteTemplate);

export default router;
