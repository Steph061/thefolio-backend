// backend/middleware/auth.middleware.js
const jwt = require('jsonwebtoken');
// OLD: const User = require('../models/User');
// NEW: use pool directly
const pool = require('../config/db');

const protect = async (req, res, next) => {
  let token;

  // Look for 'Authorization: Bearer <token>' in request headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized — please login first' });
  }

  try {
    // Verify the token using your JWT_SECRET
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // OLD: req.user = await User.findById(decoded.id).select('-password');
    // NEW: SQL query that excludes password column
    const result = await pool.query(
      'SELECT id, name, email, role, status, bio, profile_pic FROM users WHERE id = $1',
      [decoded.id]
    );

    if (result.rows.length === 0 || result.rows[0].status === 'inactive') {
      return res.status(401).json({ message: 'Account not found or deactivated' });
    }

    req.user = result.rows[0];

    next(); // Pass to the next handler
  } catch (err) {
    return res.status(401).json({ message: 'Token is invalid or has expired' });
  }
};

module.exports = { protect };