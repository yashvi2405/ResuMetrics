const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { getDB, getNextSequenceValue } = require('../db');
const { createUserDoc, sanitiseUser } = require('../models/User');
const authenticate = require('../middleware/auth');
const config = require('../config');

const router = express.Router();

// ─── Helpers ─────────────────────────────────────────────────────────────────

function createAccessToken(userId) {
  return jwt.sign(
    { sub: String(userId) },
    config.SECRET_KEY,
    { algorithm: config.ALGORITHM, expiresIn: `${config.ACCESS_TOKEN_EXPIRE_MINUTES}m` }
  );
}

// ─── GET /api/auth/test ───────────────────────────────────────────────────────
router.get('/test', (_req, res) => {
  res.json({ message: 'Auth routes are working' });
});

// ─── POST /api/auth/register ─────────────────────────────────────────────────
router.post(
  '/register',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password')
      .isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ detail: errors.array()[0].msg });
    }

    try {
      const { name, email, password } = req.body;
      const db = getDB();

      // Check if user already exists
      const existing = await db.collection('users').findOne({ email });
      if (existing) {
        return res.status(400).json({ detail: 'Email already registered' });
      }

      const hashedPassword = await bcrypt.hash(password, 12);
      const userId = await getNextSequenceValue('user_id');

      const userDoc = createUserDoc({
        user_id: userId,
        name,
        email,
        password: hashedPassword,
        role: 'user',
        date_of_registration: new Date(),
      });

      await db.collection('users').insertOne(userDoc);

      const accessToken = createAccessToken(userId);

      return res.status(201).json({
        success: true,
        message: 'Registration successful',
        access_token: accessToken,
        token_type: 'bearer',
        user_id: userId,
        name,
        email,
      });
    } catch (err) {
      console.error('Register error:', err);
      return res.status(500).json({ detail: `Registration failed: ${err.message}` });
    }
  }
);

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ detail: errors.array()[0].msg });
    }

    try {
      const { email, password } = req.body;
      const db = getDB();

      const userDoc = await db.collection('users').findOne({ email });
      if (!userDoc) {
        return res.status(401).json({ detail: 'Invalid email or password' });
      }

      const passwordMatch = await bcrypt.compare(password, userDoc.password);
      if (!passwordMatch) {
        return res.status(401).json({ detail: 'Invalid email or password' });
      }

      // Update last login time
      await db.collection('users').updateOne(
        { user_id: userDoc.user_id },
        { $set: { last_login_time: new Date() } }
      );

      const accessToken = createAccessToken(userDoc.user_id);

      return res.json({
        success: true,
        message: 'Login successful',
        access_token: accessToken,
        token_type: 'bearer',
        user_id: userDoc.user_id,
        name: userDoc.name,
        email: userDoc.email,
      });
    } catch (err) {
      console.error('Login error:', err);
      return res.status(500).json({ detail: `Login failed: ${err.message}` });
    }
  }
);

// ─── GET /api/auth/me ─────────────────────────────────────────────────────────
router.get('/me', authenticate, (req, res) => {
  const u = req.user;
  return res.json({
    id: u.user_id,
    name: u.name,
    email: u.email,
    role: u.role,
    date_of_registration: u.date_of_registration,
    last_login_time: u.last_login_time || null,
  });
});

// ─── POST /api/auth/logout ────────────────────────────────────────────────────
router.post('/logout', authenticate, (_req, res) => {
  // JWT is stateless — client removes the token
  return res.json({ success: true, message: 'Logged out successfully' });
});

// ─── POST /api/auth/refresh ───────────────────────────────────────────────────
router.post('/refresh', authenticate, (req, res) => {
  try {
    const newToken = createAccessToken(req.user.user_id);
    return res.json({ success: true, access_token: newToken, token_type: 'bearer' });
  } catch (err) {
    return res.status(500).json({ detail: `Token refresh failed: ${err.message}` });
  }
});

// ─── POST /api/auth/change-password ──────────────────────────────────────────
router.post(
  '/change-password',
  authenticate,
  [
    body('old_password').notEmpty().withMessage('Old password is required'),
    body('new_password')
      .isLength({ min: 8 }).withMessage('New password must be at least 8 characters'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ detail: errors.array()[0].msg });
    }

    try {
      const { old_password, new_password } = req.body;
      const oldMatch = await bcrypt.compare(old_password, req.user.password);
      if (!oldMatch) {
        return res.status(401).json({ detail: 'Old password is incorrect' });
      }

      const newHash = await bcrypt.hash(new_password, 12);
      const db = getDB();
      await db.collection('users').updateOne(
        { user_id: req.user.user_id },
        { $set: { password: newHash } }
      );

      return res.json({ success: true, message: 'Password changed successfully' });
    } catch (err) {
      return res.status(500).json({ detail: `Change password failed: ${err.message}` });
    }
  }
);

module.exports = router;
