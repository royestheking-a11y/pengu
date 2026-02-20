import express from 'express';
import { quizGenerator, conceptExplainer, examPrepGenerator } from '../controllers/studyToolsController.js';

const router = express.Router();

router.post('/quiz', quizGenerator);
router.post('/explain', conceptExplainer);
router.post('/exam-prep', examPrepGenerator);

export default router;
