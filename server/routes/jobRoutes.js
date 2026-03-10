import express from 'express';
import { addJob, getJobs, updateJob, postJobProcess, getInterviewQuestions, dispatchJobApplication } from '../controllers/jobController.js';

const router = express.Router();

router.post('/', addJob);
router.get('/', getJobs);
router.patch('/:id', updateJob);
router.post('/:id/process', postJobProcess);
router.get('/:id/interview-prep', getInterviewQuestions);
router.post('/:id/dispatch', dispatchJobApplication);

export default router;
