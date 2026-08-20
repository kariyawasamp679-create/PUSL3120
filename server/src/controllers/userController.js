import User from '../models/User.js';
import Department from '../models/Department.js';
import { hashPassword } from '../utils/security.js';

/**
 * @desc    Get all users (with filtering and search)
 * @route   GET /api/users
 * @access  Private (Admin)
 */
export async function getUsers(req, res, next) {
  try {
    const { role, search, department } = req.query;
    const query = {};

    if (role) {
      query.role = role;
    }
    if (department) {
      query.department = department;
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { specialization: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .populate('department', 'name code color')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    Get all doctors (Public)
 * @route   GET /api/users/doctors
 * @access  Public
 */
export async function getDoctors(req, res, next) {
  try {
    const { department, search, isAvailable } = req.query;
    const query = { role: 'doctor' };

    if (department) {
      query.department = department;
    }
    if (isAvailable !== undefined) {
      query.isAvailable = isAvailable === 'true';
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { specialization: { $regex: search, $options: 'i' } }
      ];
    }

    const doctors = await User.find(query)
      .select('-password')
      .populate('department', 'name code icon color location')
      .sort({ name: 1 });

    res.json({
      success: true,
      count: doctors.length,
      doctors
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    Get doctor by ID
 * @route   GET /api/users/doctors/:id
 * @access  Public
 */
export async function getDoctorById(req, res, next) {
  try {
    const doctor = await User.findOne({ _id: req.params.id, role: 'doctor' })
      .select('-password')
      .populate('department', 'name code icon color location phone');

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    res.json({
      success: true,
      doctor
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    Create doctor account
 * @route   POST /api/users/doctors
 * @access  Private (Admin)
 */
export async function createDoctor(req, res, next) {
  try {
    const { name, email, password, phone, specialization, qualifications, department, consultationFee, bio, workingDays, workingHours } = req.body;

    if (!name || !email || !password || !specialization || !department) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, password, specialization, and department'
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already in use'
      });
    }

    const hashedPassword = hashPassword(password);

    const doctor = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: 'doctor',
      phone: phone || '',
      specialization,
      qualifications: qualifications || 'MBBS',
      department,
      consultationFee: consultationFee ? Number(consultationFee) : 1500,
      bio: bio || '',
      workingDays: workingDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      workingHours: workingHours || { start: '09:00', end: '17:00' }
    });

    const populatedDoctor = await User.findById(doctor._id)
      .select('-password')
      .populate('department', 'name code');

    res.status(201).json({
      success: true,
      message: 'Doctor created successfully',
      doctor: populatedDoctor
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    Create patient account (Admin registration)
 * @route   POST /api/users/patients
 * @access  Private (Admin)
 */
export async function createPatient(req, res, next) {
  try {
    const { name, email, password, phone, bloodGroup, address, emergencyContact } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide patient name, email, and password'
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email address already exists'
      });
    }

    const hashedPassword = hashPassword(password);

    const patient = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: 'patient',
      phone: phone || '',
      bloodGroup: bloodGroup || 'O+',
      address: address || '',
      emergencyContact: emergencyContact || { name: '', phone: '', relation: '' }
    });

    res.status(201).json({
      success: true,
      message: 'Patient account created successfully',
      patient: {
        _id: patient._id,
        name: patient.name,
        email: patient.email,
        role: patient.role,
        phone: patient.phone,
        bloodGroup: patient.bloodGroup
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    Update user by ID
 * @route   PUT /api/users/:id
 * @access  Private (Admin)
 */
export async function updateUser(req, res, next) {
  try {
    const allowedUpdates = [
      'name', 'phone', 'role', 'specialization', 'qualifications',
      'department', 'consultationFee', 'bio', 'isAvailable', 'workingDays', 'workingHours'
    ];

    const updates = {};
    for (const key of allowedUpdates) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }

    if (req.body.password) {
      updates.password = hashPassword(req.body.password);
    }

    const user = await User.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true
    }).select('-password').populate('department', 'name code');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User updated successfully',
      user
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    Delete user
 * @route   DELETE /api/users/:id
 * @access  Private (Admin)
 */
export async function deleteUser(req, res, next) {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent deleting self if admin
    if (user._id.toString() === (req.user._id || req.user.id).toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own administrative account'
      });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    next(error);
  }
}
