
import Course from '../models/courseModel.js';
import createCRUDRoutes from './crudController.js';
import asyncHandler from 'express-async-handler';

// Re-use standard CRUD base
const crud = createCRUDRoutes(Course);

// Specialized for Students: Get only my courses
const getMyCourses = asyncHandler(async (req, res) => {
    const courses = await Course.find({ userId: req.user._id });
    res.json(courses);
});

// Create with userId
const createCourse = asyncHandler(async (req, res) => {
    const { name } = req.body;
    if (!name) {
        res.status(400);
        throw new Error('Course name is required');
    }

    // Optional: Check if user already has this course name
    const exists = await Course.findOne({ userId: req.user._id, name: name.trim() });
    if (exists) {
        res.status(200).json(exists); // Just return existing
        return;
    }

    const course = await Course.create({
        userId: req.user._id,
        name: name.trim()
    });

    res.status(201).json(course);
});

export const getAll = crud.getAll;
export const getById = crud.getById;
export const update = crud.update;
export const remove = crud.remove;

export {
    getMyCourses,
    createCourse as create
};
