// routes/userRoute.js
import express from 'express';
import {
    createUser,
    registerUser,
    loginUser,
    logoutUser,
    getUserProfile,
    nearByMe
} from '../controllers/UserController.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/create', createUser);
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/nearby-me', nearByMe);
// Protected routes
router.post('/logout', authenticate, logoutUser);
router.get('/profile', authenticate, getUserProfile);

export default router;