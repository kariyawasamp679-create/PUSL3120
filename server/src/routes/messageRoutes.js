import express from 'express';
import { getMessagesByAppointment, sendMessage } from '../controllers/messageController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/appointment/:appointmentId', protect, getMessagesByAppointment);
router.post('/', protect, sendMessage);

export default router;
