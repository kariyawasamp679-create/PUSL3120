import Appointment from '../models/Appointment.js';
import User from '../models/User.js';
import Department from '../models/Department.js';
import { broadcastAppointmentEvent, emitNotification } from '../socket.js';

// Standard clinic consultation slots
const STANDARD_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
];

/**
 * @desc    Book a new appointment
 * @route   POST /api/appointments
 * @access  Private (Patient or Admin)
 */
export async function createAppointment(req, res, next) {
  try {
    const { doctorId, departmentId, appointmentDate, timeSlot, reason, symptoms, type } = req.body;
    const patientId = req.user.role === 'admin' && req.body.patientId ? req.body.patientId : (req.user._id || req.user.id);

    if (!doctorId || !appointmentDate || !timeSlot || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Please provide doctorId, appointmentDate, timeSlot, and reason'
      });
    }

    // Verify doctor exists and is active
    const doctor = await User.findOne({ _id: doctorId, role: 'doctor' });
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Selected doctor not found'
      });
    }

    // Parse date to start of day UTC
    const targetDate = new Date(appointmentDate);
    const startOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
    const endOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 23, 59, 59, 999);

    // Collision Check: Check if slot is already booked for this doctor on this date
    const existingBooking = await Appointment.findOne({
      doctor: doctorId,
      appointmentDate: { $gte: startOfDay, $lte: endOfDay },
      timeSlot: timeSlot.trim(),
      status: { $nin: ['cancelled'] }
    });

    if (existingBooking) {
      return res.status(409).json({
        success: false,
        message: `The ${timeSlot} slot on ${startOfDay.toISOString().split('T')[0]} is already booked with Dr. ${doctor.name}. Please select a different time.`
      });
    }

    // Determine department
    const deptId = departmentId || doctor.department;
    if (!deptId) {
      return res.status(400).json({
        success: false,
        message: 'Department reference is required'
      });
    }

    // Create meeting room ID for tele-consultation
    const meetingRoomId = `consult-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    const appointment = await Appointment.create({
      patient: patientId,
      doctor: doctorId,
      department: deptId,
      appointmentDate: startOfDay,
      timeSlot: timeSlot.trim(),
      reason,
      symptoms: Array.isArray(symptoms) ? symptoms : (symptoms ? [symptoms] : []),
      type: type || 'in-person',
      fee: doctor.consultationFee || 45,
      meetingRoomId,
      status: 'confirmed'
    });

    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('patient', 'name email phone avatar dateOfBirth')
      .populate('doctor', 'name email specialization qualifications avatar consultationFee')
      .populate('department', 'name code location color icon');

    // Real-Time WebSocket Broadcasts
    broadcastAppointmentEvent('appointment:created', {
      doctorId,
      date: startOfDay.toISOString().split('T')[0],
      timeSlot: timeSlot.trim(),
      appointment: populatedAppointment
    });

    // Send direct notification to doctor
    emitNotification(`user:${doctorId}`, 'notification:new_booking', {
      title: 'New Appointment Scheduled',
      message: `Patient ${populatedAppointment.patient?.name || 'User'} booked a session on ${startOfDay.toDateString()} at ${timeSlot}.`,
      appointmentId: appointment._id
    });

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully',
      appointment: populatedAppointment
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    Get appointments list (Filtered by role & criteria)
 * @route   GET /api/appointments
 * @access  Private
 */
export async function getAppointments(req, res, next) {
  try {
    const { status, date, doctorId, patientId, departmentId } = req.query;
    const query = {};

    // Role-based filtering
    if (req.user.role === 'patient') {
      query.patient = req.user._id || req.user.id;
    } else if (req.user.role === 'doctor') {
      query.doctor = req.user._id || req.user.id;
    } else if (req.user.role === 'admin') {
      if (doctorId) query.doctor = doctorId;
      if (patientId) query.patient = patientId;
    }

    if (status) {
      query.status = status;
    }

    if (departmentId) {
      query.department = departmentId;
    }

    if (date) {
      const targetDate = new Date(date);
      const startOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
      const endOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 23, 59, 59, 999);
      query.appointmentDate = { $gte: startOfDay, $lte: endOfDay };
    }

    const appointments = await Appointment.find(query)
      .populate('patient', 'name email phone avatar bloodGroup dateOfBirth')
      .populate('doctor', 'name email specialization qualifications avatar consultationFee department')
      .populate('department', 'name code location color icon')
      .sort({ appointmentDate: 1, timeSlot: 1 });

    res.json({
      success: true,
      count: appointments.length,
      appointments
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    Get single appointment by ID
 * @route   GET /api/appointments/:id
 * @access  Private
 */
export async function getAppointmentById(req, res, next) {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patient', 'name email phone avatar dateOfBirth bloodGroup emergencyContact')
      .populate('doctor', 'name email specialization qualifications avatar consultationFee bio')
      .populate('department', 'name code location color icon phone');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Access check: User must be the patient, the doctor, or an admin
    const userId = (req.user._id || req.user.id).toString();
    const isPatient = appointment.patient?._id?.toString() === userId || appointment.patient?.toString() === userId;
    const isDoctor = appointment.doctor?._id?.toString() === userId || appointment.doctor?.toString() === userId;
    const isAdmin = req.user.role === 'admin';

    if (!isPatient && !isDoctor && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this appointment'
      });
    }

    res.json({
      success: true,
      appointment
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    Update appointment status (Confirm, Complete, Cancel)
 * @route   PATCH /api/appointments/:id/status
 * @access  Private
 */
export async function updateAppointmentStatus(req, res, next) {
  try {
    const { status, doctorNotes, cancellationReason } = req.body;

    if (!status || !['pending', 'confirmed', 'completed', 'cancelled', 'rescheduled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid appointment status'
      });
    }

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    appointment.status = status;
    if (doctorNotes !== undefined) appointment.doctorNotes = doctorNotes;
    if (cancellationReason !== undefined) appointment.cancellationReason = cancellationReason;

    await appointment.save();

    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('patient', 'name email phone avatar')
      .populate('doctor', 'name email specialization avatar')
      .populate('department', 'name code');

    // Real-Time Broadcast of status update
    broadcastAppointmentEvent('appointment:updated', populatedAppointment);

    // Notify patient
    emitNotification(`user:${appointment.patient}`, 'notification:appointment_status', {
      title: `Appointment ${status.toUpperCase()}`,
      message: `Your appointment with Dr. ${populatedAppointment.doctor?.name} on ${new Date(appointment.appointmentDate).toDateString()} is now marked as ${status}.`,
      appointmentId: appointment._id,
      status
    });

    res.json({
      success: true,
      message: `Appointment status updated to ${status}`,
      appointment: populatedAppointment
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    Reschedule appointment
 * @route   PATCH /api/appointments/:id/reschedule
 * @access  Private
 */
export async function rescheduleAppointment(req, res, next) {
  try {
    const { newDate, newTimeSlot } = req.body;

    if (!newDate || !newTimeSlot) {
      return res.status(400).json({
        success: false,
        message: 'Please provide newDate and newTimeSlot'
      });
    }

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    const targetDate = new Date(newDate);
    const startOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
    const endOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 23, 59, 59, 999);

    // Collision check for new slot
    const slotConflict = await Appointment.findOne({
      _id: { $ne: appointment._id },
      doctor: appointment.doctor,
      appointmentDate: { $gte: startOfDay, $lte: endOfDay },
      timeSlot: newTimeSlot.trim(),
      status: { $nin: ['cancelled'] }
    });

    if (slotConflict) {
      return res.status(409).json({
        success: false,
        message: `The ${newTimeSlot} slot is already booked on this date. Please select another slot.`
      });
    }

    appointment.appointmentDate = startOfDay;
    appointment.timeSlot = newTimeSlot.trim();
    appointment.status = 'confirmed';
    await appointment.save();

    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('patient', 'name email avatar')
      .populate('doctor', 'name email specialization avatar')
      .populate('department', 'name code');

    broadcastAppointmentEvent('appointment:updated', populatedAppointment);

    res.json({
      success: true,
      message: 'Appointment rescheduled successfully',
      appointment: populatedAppointment
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    Get available slots for a doctor on a specific date
 * @route   GET /api/appointments/available-slots
 * @access  Public
 */
export async function getDoctorAvailableSlots(req, res, next) {
  try {
    const { doctorId, date } = req.query;

    if (!doctorId || !date) {
      return res.status(400).json({
        success: false,
        message: 'doctorId and date are required'
      });
    }

    const targetDate = new Date(date);
    const startOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
    const endOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 23, 59, 59, 999);

    // Find all active booked appointments for this doctor on this day
    const bookedAppointments = await Appointment.find({
      doctor: doctorId,
      appointmentDate: { $gte: startOfDay, $lte: endOfDay },
      status: { $nin: ['cancelled'] }
    }).select('timeSlot patient status');

    const bookedSlotMap = new Map();
    bookedAppointments.forEach((app) => {
      bookedSlotMap.set(app.timeSlot, app);
    });

    const currentUserId = req.user ? (req.user._id || req.user.id).toString() : null;

    const slots = STANDARD_SLOTS.map((slot) => {
      const isBooked = bookedSlotMap.has(slot);
      const booking = isBooked ? bookedSlotMap.get(slot) : null;
      const bookedByMe = currentUserId && booking && booking.patient?.toString() === currentUserId;

      return {
        time: slot,
        available: !isBooked,
        bookedByMe: Boolean(bookedByMe),
        status: isBooked ? 'booked' : 'available'
      };
    });

    res.json({
      success: true,
      date: startOfDay.toISOString().split('T')[0],
      doctorId,
      slots
    });
  } catch (error) {
    next(error);
  }
}
