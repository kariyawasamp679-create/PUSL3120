import express from 'express';
import {
  getUsers,
  getDoctors,
  getDoctorById,
  createDoctor,
  updateUser,
  deleteUser
} from '../controllers/userController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public doctor discovery routes
router.get('/doctors', getDoctors);
router.get('/doctors/:id', getDoctorById);

// Admin-only user management routes
router.get('/', protect, authorize('admin'), getUsers);
router.post('/doctors', protect, authorize('admin'), createDoctor);
router.put('/:id', protect, authorize('admin'), updateUser);
router.delete('/:id', protect, authorize('admin'), deleteUser);

export default router;
