import User from '../models/User.js';
import { hashPassword, comparePassword, generateToken } from '../utils/security.js';

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
export async function register(req, res, next) {
  try {
    const { name, email, password, role, phone, specialization, department, consultationFee } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email address already exists'
      });
    }

    // Hash password
    const hashedPassword = hashPassword(password);

    // Create user (default role is patient unless specified and permitted)
    const userRole = role && ['patient', 'doctor', 'admin'].includes(role) ? role : 'patient';

    const userData = {
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: userRole,
      phone: phone || ''
    };

    if (userRole === 'doctor') {
      if (specialization) userData.specialization = specialization;
      if (department) userData.department = department;
      if (consultationFee) userData.consultationFee = Number(consultationFee);
    }

    const user = await User.create(userData);

    const token = generateToken({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role
    });

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        specialization: user.specialization,
        avatar: user.avatar
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    let user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Auto-provision demo accounts if empty
      const { ensureDefaultData } = await import('../utils/autoSeed.js');
      await ensureDefaultData();
      user = await User.findOne({ email: email.toLowerCase() });
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }


    const isMatch = comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const token = generateToken({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role
    });

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        specialization: user.specialization,
        qualifications: user.qualifications,
        department: user.department,
        consultationFee: user.consultationFee,
        avatar: user.avatar
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
export async function getMe(req, res, next) {
  try {
    const user = await User.findById(req.user._id || req.user.id)
      .select('-password')
      .populate('department', 'name code location');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found'
      });
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    Update user profile
 * @route   PUT /api/auth/profile
 * @access  Private
 */
export async function updateProfile(req, res, next) {
  try {
    const userId = req.user._id || req.user.id;
    const allowedFields = [
      'name', 'phone', 'avatar', 'dateOfBirth', 'gender', 'bloodGroup',
      'address', 'emergencyContact', 'bio', 'specialization', 'qualifications',
      'consultationFee', 'workingDays', 'workingHours'
    ];

    const updates = {};
    for (const key of allowedFields) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updates, {
      new: true,
      runValidators: true
    }).select('-password').populate('department', 'name code');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    next(error);
  }
}
