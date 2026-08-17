import MedicalRecord from '../models/MedicalRecord.js';
import Appointment from '../models/Appointment.js';
import User from '../models/User.js';
import { emitNotification } from '../socket.js';

/**
 * @desc    Create a new medical record & prescription
 * @route   POST /api/medical-records
 * @access  Private (Doctor or Admin)
 */
export async function createRecord(req, res, next) {
  try {
    const {
      patientId,
      appointmentId,
      diagnosis,
      vitals,
      symptoms,
      clinicalNotes,
      prescriptions,
      labTestsRecommended,
      followUpDate
    } = req.body;

    const doctorId = req.user.role === 'doctor' ? (req.user._id || req.user.id) : req.body.doctorId;

    if (!patientId || !diagnosis) {
      return res.status(400).json({
        success: false,
        message: 'Please provide patientId and diagnosis'
      });
    }

    const patient = await User.findById(patientId);
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    const record = await MedicalRecord.create({
      patient: patientId,
      doctor: doctorId,
      appointment: appointmentId || null,
      diagnosis,
      vitals: vitals || {},
      symptoms: Array.isArray(symptoms) ? symptoms : (symptoms ? [symptoms] : []),
      clinicalNotes: clinicalNotes || '',
      prescriptions: Array.isArray(prescriptions) ? prescriptions : [],
      labTestsRecommended: Array.isArray(labTestsRecommended) ? labTestsRecommended : [],
      followUpDate: followUpDate ? new Date(followUpDate) : null
    });

    // If linked to an appointment, mark it completed
    if (appointmentId) {
      await Appointment.findByIdAndUpdate(appointmentId, {
        status: 'completed'
      });
    }

    const populatedRecord = await MedicalRecord.findById(record._id)
      .populate('patient', 'name email phone dateOfBirth bloodGroup gender')
      .populate('doctor', 'name email specialization qualifications department')
      .populate('appointment', 'appointmentDate timeSlot reason type');

    // Notify patient
    emitNotification(`user:${patientId}`, 'notification:new_medical_record', {
      title: 'New Medical Record Available',
      message: `Dr. ${populatedRecord.doctor?.name} has published your clinical report and prescription.`,
      recordId: record._id
    });

    res.status(201).json({
      success: true,
      message: 'Medical record and prescription created successfully',
      record: populatedRecord
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    Get medical records list (Filtered by role)
 * @route   GET /api/medical-records
 * @access  Private
 */
export async function getRecords(req, res, next) {
  try {
    const { patientId, doctorId, search } = req.query;
    const query = {};

    if (req.user.role === 'patient') {
      query.patient = req.user._id || req.user.id;
    } else if (req.user.role === 'doctor') {
      if (patientId) {
        query.patient = patientId;
      } else {
        query.doctor = req.user._id || req.user.id;
      }
    } else if (req.user.role === 'admin') {
      if (patientId) query.patient = patientId;
      if (doctorId) query.doctor = doctorId;
    }

    if (search) {
      query.$or = [
        { diagnosis: { $regex: search, $options: 'i' } },
        { clinicalNotes: { $regex: search, $options: 'i' } }
      ];
    }

    const records = await MedicalRecord.find(query)
      .populate('patient', 'name email phone bloodGroup dateOfBirth gender')
      .populate('doctor', 'name email specialization qualifications')
      .populate('appointment', 'appointmentDate timeSlot reason')
      .sort({ visitDate: -1 });

    res.json({
      success: true,
      count: records.length,
      records
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    Get single medical record by ID
 * @route   GET /api/medical-records/:id
 * @access  Private
 */
export async function getRecordById(req, res, next) {
  try {
    const record = await MedicalRecord.findById(req.params.id)
      .populate('patient', 'name email phone bloodGroup dateOfBirth gender address emergencyContact')
      .populate('doctor', 'name email specialization qualifications department')
      .populate('appointment', 'appointmentDate timeSlot reason type');

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Medical record not found'
      });
    }

    const userId = (req.user._id || req.user.id).toString();
    const isPatient = record.patient?._id?.toString() === userId;
    const isDoctor = record.doctor?._id?.toString() === userId;
    const isAdmin = req.user.role === 'admin';

    if (!isPatient && !isDoctor && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this record'
      });
    }

    res.json({
      success: true,
      record
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    Update medical record
 * @route   PUT /api/medical-records/:id
 * @access  Private (Doctor or Admin)
 */
export async function updateRecord(req, res, next) {
  try {
    const record = await MedicalRecord.findById(req.params.id);
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Medical record not found'
      });
    }

    const userId = (req.user._id || req.user.id).toString();
    if (req.user.role !== 'admin' && record.doctor?.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to edit this record'
      });
    }

    const updated = await MedicalRecord.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    })
      .populate('patient', 'name email bloodGroup')
      .populate('doctor', 'name email specialization');

    res.json({
      success: true,
      message: 'Medical record updated successfully',
      record: updated
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    Get patient clinical history
 * @route   GET /api/medical-records/patient/:patientId
 * @access  Private
 */
export async function getPatientHistory(req, res, next) {
  try {
    const patientId = req.params.patientId;
    const userId = (req.user._id || req.user.id).toString();

    // Check authorization: must be that patient, a doctor, or an admin
    if (req.user.role === 'patient' && patientId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view other patients history'
      });
    }

    const records = await MedicalRecord.find({ patient: patientId })
      .populate('doctor', 'name specialization qualifications')
      .populate('appointment', 'appointmentDate timeSlot')
      .sort({ visitDate: -1 });

    const patient = await User.findById(patientId).select('-password');

    res.json({
      success: true,
      patient,
      count: records.length,
      history: records
    });
  } catch (error) {
    next(error);
  }
}
