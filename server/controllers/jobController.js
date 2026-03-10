import expressAsyncHandler from 'express-async-handler';
import Job from '../models/jobModel.js';

// @desc    Receive job data from Chrome Extension
// @route   POST /api/jobs
// @access  Public
const addJob = expressAsyncHandler(async (req, res) => {
    const { title, url, description, source, role, company } = req.body;

    if (!url || !description) {
        res.status(400);
        throw new Error('Missing required fields: url or description');
    }

    // Determine Role
    let finalRole = role || title || "Software Engineer";

    // Determine Company - Try to extract from title if company is missing (e.g., "Developer at Google")
    let finalCompany = company;
    if (!finalCompany) {
        if (title?.includes(' at ')) {
            finalCompany = title.split(' at ')[1].trim();
        } else if (url.includes("demo")) {
            finalCompany = "Demo Corp";
        } else {
            finalCompany = "Extracted Company";
        }
    }

    const job = await Job.create({
        company: finalCompany,
        role: finalRole,
        url,
        description,
        source: source || 'Pengu Chrome Extension',
        status: 'scraping',
        activeAgent: 'Team Lead',
        progress: 0
    });

    if (job) {
        console.log("===============================");
        console.log("🔥 NEW JOB PERSISTED TO MONGODB");
        console.log("Company:", job.company);
        console.log("Role:", job.role);
        console.log("===============================");

        res.status(201).json({
            message: 'Job successfully persisted',
            success: true,
            job
        });
    } else {
        res.status(400);
        throw new Error('Invalid job data');
    }
});

// @desc    Get all jobs
// @route   GET /api/jobs
// @access  Public
const getJobs = expressAsyncHandler(async (req, res) => {
    const jobs = await Job.find({}).sort({ createdAt: -1 });
    res.json(jobs);
});

// @desc    Update a job
// @route   PATCH /api/jobs/:id
// @access  Public
const updateJob = expressAsyncHandler(async (req, res) => {
    const job = await Job.findById(req.params.id);

    if (job) {
        Object.assign(job, req.body);
        const updatedJob = await job.save();
        res.json(updatedJob);
    } else {
        res.status(404);
        throw new Error('Job not found');
    }
});

import { processJobAgents, runInterviewPrepAgent } from '../services/agentService.js';

// @desc    Process job with AI agents
// @route   POST /api/jobs/:id/process
// @access  Public
const postJobProcess = expressAsyncHandler(async (req, res) => {
    const job = await Job.findById(req.params.id);
    if (!job) {
        res.status(404);
        throw new Error('Job not found');
    }

    // Trigger agents in background
    processJobAgents(job._id);

    res.json({ message: 'AI processing started', success: true });
});

// @desc    Get interview questions for a job
// @route   GET /api/jobs/:id/interview-prep
// @access  Public
const getInterviewQuestions = expressAsyncHandler(async (req, res) => {
    const job = await Job.findById(req.params.id);
    if (!job) {
        res.status(404);
        throw new Error('Job not found');
    }

    const questions = await runInterviewPrepAgent(job);
    res.json(questions);
});

import { dispatchApplication as sendMail } from '../services/dispatchService.js';

// @desc    Dispatch application via Gmail
// @route   POST /api/jobs/:id/dispatch
// @access  Public
const dispatchJobApplication = expressAsyncHandler(async (req, res) => {
    const job = await Job.findById(req.params.id);
    if (!job) {
        res.status(404);
        throw new Error('Job not found');
    }

    const { targetEmail, cvUrl, clUrl, finalEmailBody } = req.body;
    if (targetEmail) {
        job.targetEmail = targetEmail;
    }
    if (finalEmailBody) {
        job.draftedEmail = finalEmailBody;
    }
    await job.save();

    if (!cvUrl) {
        res.status(400);
        throw new Error('CV Cloudinary URL is missing');
    }

    const result = await sendMail(job, cvUrl, clUrl);
    res.json(result);
});

export { addJob, getJobs, updateJob, postJobProcess, getInterviewQuestions, dispatchJobApplication };
