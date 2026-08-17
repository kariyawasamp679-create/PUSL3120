import express from 'express';
import {
  createRecord,
  getRecords,
  getRecordById,
  updateRecord,
  getPatientHistory
} from '../controllers/medicalRecordController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, authorize('doctor', 'admin'), createRecord);
router.get('/', protect, getRecords);
router.get('/:id', protect, getRecordById);
router.put('/:id', protect, authorize('doctor', 'admin'), updateRecord);
router.get('/patient/:patientId', protect, getPatientHistory);

export default router;
