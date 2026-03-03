import express from 'express';
import { analyzeMatch, optimizeCV, generateEmail, prepareInterview } from '../controllers/careerAccelerationController.js';

const router = express.Router();

router.post('/analyze', analyzeMatch);
router.post('/optimize', optimizeCV);
router.post('/generate-email', generateEmail);
router.post('/prepare-interview', prepareInterview);

export default router;
