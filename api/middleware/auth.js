const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) return res.status(401).json({ message: 'Not authorized, no token' });

  try {
    const secret = process.env.JWT_SECRET || 'v3rc3l_s3cr3t_fallback_123';
    console.log('Middleware: Checking token with secret exists:', !!secret);
    const decoded = jwt.verify(token, secret);
    console.log('Middleware: Decoded ID:', decoded.id);
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) {
      console.log('Middleware: User not found in DB for ID:', decoded.id);
      return res.status(401).json({ message: 'User not found' });
    }
    next();
  } catch (err) {
    console.error('Middleware: Auth Error:', err.message);
    res.status(401).json({ message: 'Token invalid or expired', error: err.message });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') return next();
  res.status(403).json({ message: 'Admin access required' });
};

module.exports = { protect, adminOnly };
