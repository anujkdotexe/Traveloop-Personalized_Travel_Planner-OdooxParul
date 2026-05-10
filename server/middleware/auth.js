const jwt = require('jsonwebtoken');

// Verify JWT and User Type
const verifyUser = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];
  
  if (!token) return res.status(401).json({ message: 'Access Denied: No Token Provided' });

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).json({ message: 'Invalid Token' });
  }
};

// Admin Only Middleware
const verifyAdmin = (req, res, next) => {
  verifyUser(req, res, () => {
    if (req.user.role === 'admin') {
      next();
    } else {
      res.status(403).json({ message: 'Access Denied: Admin Rights Required' });
    }
  });
};

module.exports = { verifyUser, verifyAdmin };
