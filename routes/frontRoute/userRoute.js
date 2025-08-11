import express from 'express';
import {
    createUser,
    registerUser,
    loginUser,
    logoutUser,
    getUserProfile,
    nearByMe,
    sendOTP,
    setPassword,
    verifyOTP
} from '../../controllers/frontend/UserController.js';
import { authenticate } from '../../middlewares/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/create', createUser);
router.post('/login', loginUser);
router.post('/register', registerUser);
router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);
router.post('/set-password', setPassword);
router.get('/nearby-me', nearByMe);
// Protected routes
router.post('/logout', authenticate, logoutUser);
router.get('/profile', authenticate, getUserProfile);

export default router;