import express from 'express';
import {
  createAppointment,
  getAppointments,
  getAppointmentById,
  updateAppointmentStatus,
  rescheduleAppointment,
  getDoctorAvailableSlots
} from '../controllers/appointmentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public / Authenticated helper for slot discovery
router.get('/available-slots', getDoctorAvailableSlots);

// Authenticated appointment management
router.post('/', protect, createAppointment);
router.get('/', protect, getAppointments);
router.get('/:id', protect, getAppointmentById);
router.patch('/:id/status', protect, updateAppointmentStatus);
router.patch('/:id/reschedule', protect, rescheduleAppointment);

export default router;
