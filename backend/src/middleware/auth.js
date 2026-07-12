/**
 * ============================================================
 * AssetFlow — Authentication & Authorization Middleware
 * ============================================================
 * EXPORTED FOR REUSE by all module routes:
 *   const { authenticateToken, authorizeRoles } = require('../middleware/auth');
 *
 * authenticateToken:
 *   Verifies JWT from Authorization: Bearer <token> header.
 *   Attaches req.user = { id, role, department_id }.
 *   Returns 401 if missing/invalid.
 *
 * authorizeRoles(...roles):
 *   Checks req.user.role is in the allowed list.
 *   Returns 403 if not.
 * ============================================================
 */

const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'assetflow-hackathon-secret';

/**
 * Verify JWT token and attach user payload to req.user
 */
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : null;

  if (!token) {
    return res.status(401).json({
      success: false,
      data: null,
      error: 'Authentication required. Please provide a valid token.',
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = {
      id: decoded.id,
      role: decoded.role,
      department_id: decoded.department_id,
    };
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      data: null,
      error: 'Invalid or expired token.',
    });
  }
}

/**
 * Authorize specific roles. Usage:
 *   router.post('/admin-only', authenticateToken, authorizeRoles('admin'), handler)
 *   router.get('/managers', authenticateToken, authorizeRoles('admin', 'asset_manager'), handler)
 */
function authorizeRoles(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        data: null,
        error: 'You do not have permission to access this resource.',
      });
    }
    next();
  };
}

module.exports = { authenticateToken, authorizeRoles };
