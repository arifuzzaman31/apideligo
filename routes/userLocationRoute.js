// routes/userLocationRoute.js
import express from 'express';
import {
  createOrUpdateUserLocation,
  getUserLocation,
  updateUserLocation,
  deleteUserLocation,
  getAllUserLocations,
  findUsersWithinRadius
} from '../controllers/UserLocationController.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Create or update user location
router.post('/', createOrUpdateUserLocation);

// Get current user's location
router.get('/me', getUserLocation);

// Update current user's location
router.put('/me', updateUserLocation);

// Delete current user's location
router.delete('/me', deleteUserLocation);

router.get('/', getAllUserLocations);
router.post('/find-within-radius', findUsersWithinRadius);

export default router;