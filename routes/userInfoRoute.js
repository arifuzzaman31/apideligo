// routes/userInfoRoute.js
import express from 'express';
import {
  createOrUpdateUserInfo,
  getUserInfo,
  updateUserInfo,
  deleteUserInfo,
  getAllUserInfo,
  createOrUpdateUserAddress
} from '../controllers/UserInfoController.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Create user info
router.post('/', createOrUpdateUserInfo);

// Get current user's info
router.get('/me', getUserInfo);

// Update current user's info
router.put('/me', updateUserInfo);

// Soft delete current user's info
router.delete('/me', deleteUserInfo);

router.get('/', getAllUserInfo);

router.post('/address',createOrUpdateUserAddress)

export default router;