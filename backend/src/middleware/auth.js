const jwt = require('jsonwebtoken');
const { getDB } = require('../db');
const config = require('../config');

/**
 * Express middleware that validates a Bearer JWT and attaches
 * the full user document to req.user.
 *
 * Mirrors Python's get_current_user() dependency.
 */
async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ detail: 'Not authenticated' });
    }

    const token = authHeader.slice(7); // strip "Bearer "

    let payload;
    try {
      payload = jwt.verify(token, config.SECRET_KEY, { algorithms: [config.ALGORITHM] });
    } catch {
      return res.status(401).json({ detail: 'Invalid token' });
    }

    const userId = parseInt(payload.sub, 10);
    if (isNaN(userId)) {
      return res.status(401).json({ detail: 'Invalid token' });
    }

    const db = getDB();
    const userDoc = await db.collection('users').findOne({ user_id: userId });
    if (!userDoc) {
      return res.status(401).json({ detail: 'User not found' });
    }

    req.user = userDoc; // full user document available in route handlers
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    return res.status(500).json({ detail: 'Internal server error' });
  }
}

module.exports = authenticate;
