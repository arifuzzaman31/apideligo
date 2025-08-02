// routes/userInfoRoute.js
import express from 'express';
import {
  createUserInfo,
  getUserInfo,
  updateUserInfo,
  deleteUserInfo,
  getAllUserInfo
} from '../controllers/UserInfoController.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Create user info
router.post('/', createUserInfo);

// Get current user's info
router.get('/me', getUserInfo);

// Update current user's info
router.put('/me', updateUserInfo);

// Soft delete current user's info
router.delete('/me', deleteUserInfo);

router.get('/', getAllUserInfo);

export default router;