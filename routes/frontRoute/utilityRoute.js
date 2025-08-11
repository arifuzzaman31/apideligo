import express from 'express';
import {
    getAllCategories
} from '../../controllers/frontend/UtilityController.js';

const router = express.Router();
// Public routes
router.get('/categories', getAllCategories);
// Add more utility routes as needed
export default router;