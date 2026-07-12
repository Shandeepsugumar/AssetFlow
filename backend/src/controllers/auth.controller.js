/**
 * ============================================================
 * AssetFlow — Auth Controller
 * ============================================================
 * POST /api/auth/signup          — Employee-only registration
 * POST /api/auth/login           — Returns JWT + user
 * POST /api/auth/forgot-password — Dev-mode: returns reset token
 * POST /api/auth/reset-password  — Validates token, resets password
 * GET  /api/auth/me              — Returns current user from JWT
 * ============================================================
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/db');
const { logActivity } = require('../services/activityLog.service');

const JWT_SECRET = process.env.JWT_SECRET || 'assetflow-hackathon-secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const SALT_ROUNDS = 10;
const RESET_TOKEN_EXPIRY = parseInt(process.env.RESET_TOKEN_EXPIRY_MINUTES || '60', 10);

// Helper: strip password_hash from user object
function sanitizeUser(user) {
  const { password_hash, ...safe } = user;
  return safe;
}

// Helper: generate JWT
function generateToken(user) {
  return jwt.sign(
    { id: user.id, role: user.role, department_id: user.department_id },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

/**
 * POST /api/auth/signup
 * Creates an EMPLOYEE account only — role is forced server-side.
 */
async function signup(req, res) {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, data: null, error: 'Name is required' });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, data: null, error: 'Email is required' });
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      return res.status(400).json({ success: false, data: null, error: 'Invalid email format' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, data: null, error: 'Password must be at least 6 characters' });
    }

    // Check email uniqueness
    const existing = await db.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase().trim()]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ success: false, data: null, error: 'An account with this email already exists' });
    }

    // Hash password and create user — ROLE IS ALWAYS 'employee'
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const result = await db.query(
      `INSERT INTO users (name, email, password_hash, role, is_active)
       VALUES ($1, $2, $3, 'employee', true)
       RETURNING *`,
      [name.trim(), email.toLowerCase().trim(), passwordHash]
    );

    const user = sanitizeUser(result.rows[0]);
    const token = generateToken(user);

    await logActivity({
      userId: user.id,
      action: `New employee account created: ${user.name}`,
      entityType: 'user',
      entityId: user.id,
    });

    res.status(201).json({ success: true, data: { token, user }, error: null });
  } catch (err) {
    console.error('[Auth] Signup error:', err.message);
    res.status(500).json({ success: false, data: null, error: 'Internal server error' });
  }
}

/**
 * POST /api/auth/login
 * Validates credentials, returns JWT + user object.
 */
async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, data: null, error: 'Email and password are required' });
    }

    const result = await db.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase().trim()]);
    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, data: null, error: 'Invalid email or password' });
    }

    const user = result.rows[0];

    if (!user.is_active) {
      return res.status(401).json({ success: false, data: null, error: 'Account is deactivated. Contact your administrator.' });
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ success: false, data: null, error: 'Invalid email or password' });
    }

    const token = generateToken(user);
    const safeUser = sanitizeUser(user);

    res.json({ success: true, data: { token, user: safeUser }, error: null });
  } catch (err) {
    console.error('[Auth] Login error:', err.message);
    res.status(500).json({ success: false, data: null, error: 'Internal server error' });
  }
}

/**
 * POST /api/auth/forgot-password
 * Generates a reset token and returns it directly (dev-mode stand-in for email).
 * In production, this would send an email with the token/link instead.
 */
async function forgotPassword(req, res) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, data: null, error: 'Email is required' });
    }

    const userResult = await db.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase().trim()]);

    // Always return success to prevent email enumeration
    if (userResult.rows.length === 0) {
      return res.json({
        success: true,
        data: { message: 'If an account with that email exists, a reset link has been sent.' },
        error: null,
      });
    }

    const userId = userResult.rows[0].id;
    const token = uuidv4();
    const expiresAt = new Date(Date.now() + RESET_TOKEN_EXPIRY * 60 * 1000);

    // Invalidate any existing unused tokens for this user
    await db.query(
      'UPDATE password_reset_tokens SET used = true WHERE user_id = $1 AND used = false',
      [userId]
    );

    // Store new token
    await db.query(
      `INSERT INTO password_reset_tokens (user_id, token, expires_at)
       VALUES ($1, $2, $3)`,
      [userId, token, expiresAt]
    );

    // DEV MODE: Log and return the token directly.
    // In production, replace this with an email service call.
    console.log(`[Auth] Password reset token for ${email}: ${token}`);

    res.json({
      success: true,
      data: {
        message: 'If an account with that email exists, a reset link has been sent.',
        // DEV ONLY — remove in production
        resetToken: token,
      },
      error: null,
    });
  } catch (err) {
    console.error('[Auth] Forgot password error:', err.message);
    res.status(500).json({ success: false, data: null, error: 'Internal server error' });
  }
}

/**
 * POST /api/auth/reset-password
 * Validates reset token, updates password.
 */
async function resetPassword(req, res) {
  try {
    const { token, password } = req.body;

    if (!token) {
      return res.status(400).json({ success: false, data: null, error: 'Reset token is required' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, data: null, error: 'Password must be at least 6 characters' });
    }

    // Find valid token
    const tokenResult = await db.query(
      `SELECT * FROM password_reset_tokens
       WHERE token = $1 AND used = false AND expires_at > NOW()`,
      [token]
    );

    if (tokenResult.rows.length === 0) {
      return res.status(400).json({ success: false, data: null, error: 'Invalid or expired reset token' });
    }

    const resetRecord = tokenResult.rows[0];
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // Update password
    await db.query('UPDATE users SET password_hash = $1 WHERE id = $2', [passwordHash, resetRecord.user_id]);

    // Mark token as used
    await db.query('UPDATE password_reset_tokens SET used = true WHERE id = $1', [resetRecord.id]);

    await logActivity({
      userId: resetRecord.user_id,
      action: 'Password reset completed',
      entityType: 'user',
      entityId: resetRecord.user_id,
    });

    res.json({
      success: true,
      data: { message: 'Password has been reset successfully.' },
      error: null,
    });
  } catch (err) {
    console.error('[Auth] Reset password error:', err.message);
    res.status(500).json({ success: false, data: null, error: 'Internal server error' });
  }
}

/**
 * GET /api/auth/me
 * Returns the current user from the JWT payload.
 */
async function getMe(req, res) {
  try {
    const result = await db.query(
      `SELECT u.*, d.name as department
       FROM users u
       LEFT JOIN departments d ON u.department_id = d.id
       WHERE u.id = $1`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, data: null, error: 'User not found' });
    }

    const user = sanitizeUser(result.rows[0]);
    res.json({ success: true, data: { user }, error: null });
  } catch (err) {
    console.error('[Auth] GetMe error:', err.message);
    res.status(500).json({ success: false, data: null, error: 'Internal server error' });
  }
}

module.exports = { signup, login, forgotPassword, resetPassword, getMe };
