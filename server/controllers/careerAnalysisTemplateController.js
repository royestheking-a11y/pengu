
import CareerAnalysisTemplate from '../models/careerAnalysisTemplateModel.js';
import asyncHandler from 'express-async-handler';

// @desc    Save Career Analysis as Template
// @route   POST /api/career-templates
// @access  Private
const saveTemplate = asyncHandler(async (req, res) => {
    const { overallScore, shortlistChance, riskAreas, suggestions, date } = req.body;

    const template = await CareerAnalysisTemplate.create({
        userId: req.user._id,
        overallScore,
        shortlistChance,
        riskAreas,
        suggestions,
        date
    });

    res.status(201).json(template);
});

// @desc    Get All Career Templates
// @route   GET /api/career-templates
// @access  Private
const getTemplates = asyncHandler(async (req, res) => {
    const templates = await CareerAnalysisTemplate.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(templates);
});

// @desc    Delete a Career Template
// @route   DELETE /api/career-templates/:id
// @access  Private
const deleteTemplate = asyncHandler(async (req, res) => {
    const template = await CareerAnalysisTemplate.findById(req.params.id);
    if (!template) {
        res.status(404);
        throw new Error('Template not found');
    }

    if (template.userId.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error('Not authorized');
    }

    await template.deleteOne();
    res.json({ message: 'Template removed' });
});

export {
    saveTemplate,
    getTemplates,
    deleteTemplate
};
