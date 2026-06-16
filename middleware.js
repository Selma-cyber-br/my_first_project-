const jwt = require('jsonwebtoken');
require('dotenv').config();

const protect = (req, res, next) => {
  // Get token from header
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'No token — access denied' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // attach user info to request
    next(); // let the request continue
  } catch (err) {
    res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

module.exports = protect;