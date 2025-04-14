const express = require('express');
const router = express.Router();
const { register, login, logout, getProfile, renderRegister, renderLogin } = require('../controllers/auth.controller');
const { protect } = require('../middlewares/auth.middleware');

// Render auth pages
router.get('/register', renderRegister);
router.get('/login', renderLogin);

// Auth routes
router.post('/register', register);
router.post('/login', login);
router.get('/logout', logout);
router.get('/profile', protect, getProfile);

module.exports = router;
