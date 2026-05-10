/**
 * @file auth.js
 * @description JWT authentication middleware. Provides `verifyUser` to validate
 * bearer tokens and attach the decoded user to `req.user`, and `verifyAdmin`
 * to enforce admin-only access. Safe, non-mutating helpers used by route files.
 * @author Traveloop Team
 */

const jwt = require('jsonwebtoken');

/**
 * @description Express middleware to verify JWT from the `Authorization` header.
 * On success attaches the decoded token payload to `req.user` and calls `next()`.
 * On failure responds with 401 (missing token) or 400 (invalid token).
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
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

/**
 * @description Middleware wrapper that ensures the authenticated user has
 * an `admin` role. Calls `verifyUser` first to ensure the request is authenticated.
 * If the role check fails, responds with 403 Forbidden.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const verifyAdmin = (req, res, next) => {
  verifyUser(req, res, () => {
    if (req.user && req.user.role === 'admin') {
      next();
    } else {
      res.status(403).json({ message: 'Access Denied: Admin Rights Required' });
    }
  });
};

module.exports = { verifyUser, verifyAdmin };
