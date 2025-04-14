const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

/**
 * Generate JWT token
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

/**
 * @desc    Register a new user
 * @route   POST /auth/register
 * @access  Public
 */
const register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (userExists) {
      if (userExists.email === email) {
        return res.status(400).json({ error: true, message: 'Email already in use' });
      } else {
        return res.status(400).json({ error: true, message: 'Username already taken' });
      }
    }

    // Create new user
    const user = await User.create({
      username,
      email,
      password
    });

    // Generate token
    const token = generateToken(user._id);

    // Set cookie with token
    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      secure: process.env.NODE_ENV === 'production'
    });

    // Store user in session
    req.session.user = {
      _id: user._id,
      username: user.username,
      email: user.email,
      profileImage: user.profileImage,
      role: user.role
    };

    // Determine response based on content type
    if (req.accepts('html')) {
      return res.redirect('/');
    }

    // API response
    res.status(201).json({
      success: true,
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        profileImage: user.profileImage,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Login user
 * @route   POST /auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ error: true, message: 'Invalid email or password' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({ error: true, message: 'Invalid email or password' });
    }

    // Generate token
    const token = generateToken(user._id);

    // Set cookie with token
    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      secure: process.env.NODE_ENV === 'production'
    });

    // Store user in session
    req.session.user = {
      _id: user._id,
      username: user.username,
      email: user.email,
      profileImage: user.profileImage,
      role: user.role
    };

    // Determine response based on content type
    if (req.accepts('html')) {
      return res.redirect('/');
    }

    // API response
    res.status(200).json({
      success: true,
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        profileImage: user.profileImage,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Logout user
 * @route   GET /auth/logout
 * @access  Private
 */
const logout = (req, res) => {
  // Clear token cookie
  res.clearCookie('token');

  // Destroy session
  req.session.destroy();

  // Determine response based on content type
  if (req.accepts('html')) {
    return res.redirect('/auth/login');
  }

  // API response
  res.status(200).json({ success: true, message: 'Logged out successfully' });
};

/**
 * @desc    Get current user profile
 * @route   GET /auth/profile
 * @access  Private
 */
const getProfile = async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');

  if (!user) {
    return res.status(404).json({ error: true, message: 'User not found' });
  }

  // Determine response based on content type
  if (req.accepts('html')) {
    return res.render('profile', {
      title: 'Your Profile',
      user
    });
  }

  // API response
  res.status(200).json({
    success: true,
    user
  });
};

/**
 * @desc    Render register page
 * @route   GET /auth/register
 * @access  Public
 */
const renderRegister = (req, res) => {
  if (req.session.user) {
    return res.redirect('/');
  }

  res.render('auth/register', {
    title: 'Register',
    user: null
  });
};

/**
 * @desc    Render login page
 * @route   GET /auth/login
 * @access  Public
 */
const renderLogin = (req, res) => {
  if (req.session.user) {
    return res.redirect('/');
  }

  res.render('auth/login', {
    title: 'Login',
    user: null
  });
};

module.exports = {
  register,
  login,
  logout,
  getProfile,
  renderRegister,
  renderLogin
};
