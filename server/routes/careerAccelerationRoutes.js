import express from 'express';
import { analyzeMatch, optimizeCV, generateEmail } from '../controllers/careerAccelerationController.js';

const router = express.Router();

router.post('/analyze', analyzeMatch);
router.post('/optimize', optimizeCV);
router.post('/generate-email', generateEmail);

export default router;
