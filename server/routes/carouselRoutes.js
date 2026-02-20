import express from 'express';
import createCRUDRoutes from '../controllers/crudController.js';
import Carousel from '../models/carouselModel.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();
const crud = createCRUDRoutes(Carousel);

router.route('/').get(crud.getAll).post(protect, admin, crud.create);
router.route('/:id').get(crud.getById).put(protect, admin, crud.update).delete(protect, admin, crud.remove);

export default router;
