import Department from '../models/Department.js';
import User from '../models/User.js';

/**
 * @desc    Get all departments (Public)
 * @route   GET /api/departments
 * @access  Public
 */
export async function getDepartments(req, res, next) {
  try {
    let departments = await Department.find({ isActive: true })
      .populate('headDoctor', 'name specialization qualifications avatar')
      .sort({ name: 1 });

    if (departments.length === 0) {
      const { ensureDefaultData } = await import('../utils/autoSeed.js');
      await ensureDefaultData();
      departments = await Department.find({ isActive: true })
        .populate('headDoctor', 'name specialization qualifications avatar')
        .sort({ name: 1 });
    }


    // Calculate doctor count for each department
    const departmentsWithStats = await Promise.all(
      departments.map(async (dept) => {
        const doctorCount = await User.countDocuments({
          department: dept._id,
          role: 'doctor'
        });
        return {
          ...dept.toObject(),
          doctorCount
        };
      })
    );

    res.json({
      success: true,
      count: departmentsWithStats.length,
      departments: departmentsWithStats
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    Get department by ID
 * @route   GET /api/departments/:id
 * @access  Public
 */
export async function getDepartmentById(req, res, next) {
  try {
    const department = await Department.findById(req.params.id)
      .populate('headDoctor', 'name specialization qualifications avatar email phone');

    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    const doctors = await User.find({ department: department._id, role: 'doctor' })
      .select('-password')
      .sort({ name: 1 });

    res.json({
      success: true,
      department,
      doctors
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    Create department
 * @route   POST /api/departments
 * @access  Private (Admin)
 */
export async function createDepartment(req, res, next) {
  try {
    const { name, code, description, icon, color, location, phone, headDoctor } = req.body;

    if (!name || !code) {
      return res.status(400).json({
        success: false,
        message: 'Department name and unique code are required'
      });
    }

    const existing = await Department.findOne({
      $or: [{ name }, { code: code.toUpperCase() }]
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'A department with this name or code already exists'
      });
    }

    const department = await Department.create({
      name,
      code: code.toUpperCase(),
      description: description || '',
      icon: icon || 'Activity',
      color: color || '#0ea5e9',
      location: location || 'Building A, Level 1',
      phone: phone || '+44 20 7946 0912',
      headDoctor: headDoctor || null
    });

    res.status(201).json({
      success: true,
      message: 'Department created successfully',
      department
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    Update department
 * @route   PUT /api/departments/:id
 * @access  Private (Admin)
 */
export async function updateDepartment(req, res, next) {
  try {
    const department = await Department.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('headDoctor', 'name specialization');

    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    res.json({
      success: true,
      message: 'Department updated successfully',
      department
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    Delete department (soft deactivate or delete)
 * @route   DELETE /api/departments/:id
 * @access  Private (Admin)
 */
export async function deleteDepartment(req, res, next) {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    // Check if any doctors belong to this department
    const doctorCount = await User.countDocuments({ department: department._id });
    if (doctorCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete department with ${doctorCount} active doctors assigned. Please reassign them first.`
      });
    }

    await Department.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Department deleted successfully'
    });
  } catch (error) {
    next(error);
  }
}
