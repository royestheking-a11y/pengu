import asyncHandler from 'express-async-handler';

// Generic CRUD Controller Factory
const createCRUDRoutes = (Model) => {
    const getAll = asyncHandler(async (req, res) => {
        const items = await Model.find({});
        res.json(items);
    });

    const getById = asyncHandler(async (req, res) => {
        const item = await Model.findById(req.params.id);
        if (item) {
            res.json(item);
        } else {
            res.status(404);
            throw new Error('Item not found');
        }
    });

    const create = asyncHandler(async (req, res) => {
        const item = new Model(req.body);
        const createdItem = await item.save();
        res.status(201).json(createdItem);
    });

    const update = asyncHandler(async (req, res) => {
        const item = await Model.findById(req.params.id);
        if (item) {
            Object.assign(item, req.body);
            const updatedItem = await item.save();
            res.json(updatedItem);
        } else {
            res.status(404);
            throw new Error('Item not found');
        }
    });

    const remove = asyncHandler(async (req, res) => {
        const item = await Model.findById(req.params.id);
        if (item) {
            await item.deleteOne();
            res.json({ message: 'Item removed' });
        } else {
            res.status(404);
            throw new Error('Item not found');
        }
    });

    return { getAll, getById, create, update, remove };
};

export default createCRUDRoutes;
