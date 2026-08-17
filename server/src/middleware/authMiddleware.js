import { verifyToken } from '../utils/security.js';
import User from '../models/User.js';

/**
 * Protect routes: Validates JWT Bearer token and attaches user to req.user
 */
export async function protect(req, res, next) {
  try {
    let token = null;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.query && req.query.token) {
      token = req.query.token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized: No token provided'
      });
    }

    const decoded = verifyToken(token);
    if (!decoded || !decoded.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized: Invalid or expired token'
      });
    }

    // Attempt to load full user from database if connected
    try {
      const user = await User.findById(decoded.id).select('-password');
      if (user) {
        req.user = user;
      } else {
        req.user = {
          _id: decoded.id,
          id: decoded.id,
          name: decoded.name,
          email: decoded.email,
          role: decoded.role
        };
      }
    } catch (dbErr) {
      req.user = {
        _id: decoded.id,
        id: decoded.id,
        name: decoded.name,
        email: decoded.email,
        role: decoded.role
      };
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized: Authentication failed'
    });
  }
}

/**
 * Role-Based Access Control (RBAC) middleware
 * @param  {...string} roles - e.g. 'admin', 'doctor', 'patient'
 */
export function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized: Please log in first'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access restricted to [${roles.join(', ')}] roles`
      });
    }

    next();
  };
}
