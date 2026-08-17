import express from 'express';
import { getAdminStats, getDoctorStats, resetDatabase } from '../controllers/statsController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/admin', protect, authorize('admin'), getAdminStats);
router.get('/doctor', protect, authorize('doctor', 'admin'), getDoctorStats);
router.post('/reset-db', resetDatabase);

export default router;

