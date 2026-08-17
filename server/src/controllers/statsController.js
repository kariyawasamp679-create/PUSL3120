import Appointment from '../models/Appointment.js';
import User from '../models/User.js';
import Department from '../models/Department.js';
import MedicalRecord from '../models/MedicalRecord.js';

/**
 * @desc    Get system-wide analytics & overview metrics
 * @route   GET /api/stats/admin
 * @access  Private (Admin)
 */
export async function getAdminStats(req, res, next) {
  try {
    const totalPatients = await User.countDocuments({ role: 'patient' });
    const totalDoctors = await User.countDocuments({ role: 'doctor' });
    const totalDepartments = await Department.countDocuments({ isActive: true });
    const totalAppointments = await Appointment.countDocuments();

    // Status counts
    const confirmedAppointments = await Appointment.countDocuments({ status: 'confirmed' });
    const completedAppointments = await Appointment.countDocuments({ status: 'completed' });
    const cancelledAppointments = await Appointment.countDocuments({ status: 'cancelled' });
    const pendingAppointments = await Appointment.countDocuments({ status: 'pending' });

    // Revenue calculation
    const revenueAgg = await Appointment.aggregate([
      { $match: { status: { $in: ['confirmed', 'completed'] } } },
      { $group: { _id: null, totalRevenue: { $sum: '$fee' } } }
    ]);
    const totalRevenue = revenueAgg.length > 0 ? revenueAgg[0].totalRevenue : 0;

    // Appointments by Department
    const departmentStats = await Appointment.aggregate([
      { $group: { _id: '$department', count: { $sum: 1 } } },
      {
        $lookup: {
          from: 'departments',
          localField: '_id',
          foreignField: '_id',
          as: 'dept'
        }
      },
      { $unwind: { path: '$dept', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          name: { $ifNull: ['$dept.name', 'General Practice'] },
          count: 1
        }
      }
    ]);

    // Recent 5 appointments
    const recentAppointments = await Appointment.find()
      .populate('patient', 'name email avatar')
      .populate('doctor', 'name specialization avatar')
      .populate('department', 'name code color')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      stats: {
        totalPatients,
        totalDoctors,
        totalDepartments,
        totalAppointments,
        totalRevenue,
        statusCounts: {
          confirmed: confirmedAppointments,
          completed: completedAppointments,
          cancelled: cancelledAppointments,
          pending: pendingAppointments
        },
        departmentStats,
        recentAppointments
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    Get doctor dashboard stats
 * @route   GET /api/stats/doctor
 * @access  Private (Doctor)
 */
export async function getDoctorStats(req, res, next) {
  try {
    const doctorId = req.user._id || req.user.id;

    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);

    const totalAssigned = await Appointment.countDocuments({ doctor: doctorId });
    const todayAppointments = await Appointment.countDocuments({
      doctor: doctorId,
      appointmentDate: { $gte: startOfDay, $lte: endOfDay },
      status: { $nin: ['cancelled'] }
    });
    const completedCount = await Appointment.countDocuments({ doctor: doctorId, status: 'completed' });
    const pendingConfirmation = await Appointment.countDocuments({ doctor: doctorId, status: 'pending' });

    const totalPrescriptions = await MedicalRecord.countDocuments({ doctor: doctorId });

    res.json({
      success: true,
      stats: {
        totalAssigned,
        todayAppointments,
        completedCount,
        pendingConfirmation,
        totalPrescriptions
      }
    });
  } catch (error) {
    next(error);
  }
}


/**
 * @desc    Wipe database and re-seed clean initial state
 * @route   POST /api/stats/reset-db
 * @access  Public / Private (Admin)
 */
export async function resetDatabase(req, res, next) {
  try {
    const Message = (await import('../models/Message.js')).default;
    
    // Wipe all collections
    await Promise.all([
      User.deleteMany({}),
      Department.deleteMany({}),
      Appointment.deleteMany({}),
      MedicalRecord.deleteMany({}),
      Message.deleteMany({})
    ]);

    // Re-seed clean initial departments and test accounts
    const { ensureDefaultData } = await import('../utils/autoSeed.js');
    await ensureDefaultData();

    res.json({
      success: true,
      message: 'Database has been wiped and reset to a clean state successfully!'
    });
  } catch (error) {
    next(error);
  }
}

