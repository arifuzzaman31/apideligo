import express from 'express';
import {
    createCategory,
    updateCategory,
    deleteCategory,
    getAllCategories,
    getCategoryById
} from '../../controllers/backend/CategoryController.js';
import { adminCheck } from '../../middlewares/adminMiddleware.js';
import {validate} from '../../middlewares/validate.js';
import createCategorySchema from '../../utils/validations/categoryValidation.js';


const router = express.Router();
router.use(adminCheck);
router.post('/category', validate(createCategorySchema), createCategory);
router.put('/category/:id', updateCategory);
router.delete('/category/:id', deleteCategory);
router.get('/categories', getAllCategories);
router.get('/category/:id', getCategoryById);

export default router;