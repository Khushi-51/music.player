const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

/**
 * Authentication middleware to protect routes
 */
const protect = async (req, res, next) => {
  let token;

  // Check for token in headers or cookies
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    // Get token from header
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.token) {
    // Get token from cookie
    token = req.cookies.token;
  }

  // Check if token exists
  if (!token) {
    if (req.accepts('html')) {
      // Redirect to login page for HTML requests
      return res.redirect('/auth/login');
    }
    return res.status(401).json({ error: true, message: 'Not authorized, no token provided' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from token
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      if (req.accepts('html')) {
        return res.redirect('/auth/login');
      }
      return res.status(401).json({ error: true, message: 'User not found' });
    }

    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    if (req.accepts('html')) {
      return res.redirect('/auth/login');
    }
    return res.status(401).json({ error: true, message: 'Not authorized, invalid token' });
  }
};

/**
 * Admin role authorization middleware
 */
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    if (req.accepts('html')) {
      return res.status(403).render('error', {
        title: 'Access Denied',
        message: 'Admin access required'
      });
    }
    return res.status(403).json({ error: true, message: 'Not authorized as an admin' });
  }
};

/**
 * Session check middleware for views
 * Passes user info to views if logged in
 */
const checkSession = async (req, res, next) => {
  // Check if user is in session
  if (req.session.user) {
    res.locals.user = req.session.user;
    return next();
  }

  // If not in session, check for JWT token
  let token = req.cookies.token;

  if (token) {
    try {
      // Verify token and get user
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');

      if (user) {
        // Store user in session and locals
        req.session.user = user;
        res.locals.user = user;
      }
    } catch (error) {
      // Clear invalid token
      res.clearCookie('token');
    }
  }

  next();
};

module.exports = {
  protect,
  admin,
  checkSession
};
