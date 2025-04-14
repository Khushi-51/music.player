// Essential Node.js built-in modules
const fs = require('fs');           // File system operations
const path = require('path');       // Path manipulation utilities

// Third-party module imports
const express = require('express'); // Web framework
const dotenv = require('dotenv');   // Environment variables manager
const mongoose = require('mongoose');// MongoDB ODM
const session = require('express-session'); // Session middleware
const MongoStore = require('connect-mongo'); // MongoDB session store
const cookieParser = require('cookie-parser'); // Cookie parsing middleware
const expressLayouts = require('express-ejs-layouts'); // Template layout support

// Load environment variables from .env file
dotenv.config();

// Import custom routes
const authRoutes = require('./routes/auth.routes');       // Authentication routes
const songRoutes = require('./routes/song.routes');       // Song management routes
const playlistRoutes = require('./routes/playlist.routes');// Playlist management routes
const userRoutes = require('./routes/user.routes');       // User management routes

// Import custom middlewares
const { errorHandler } = require('./middlewares/error.middleware');
const { checkSession } = require('./middlewares/auth.middleware');
const methodOverride = require('./middlewares/method-override.middleware');

// Import utilities
const downloadDefaultImages = require('./utils/download-defaults');

// Initialize express application
const app = express();
const PORT = process.env.PORT || 3000;

// Database connection (non-blocking)
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/music-player')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Failed to connect to MongoDB:', err));

// Basic middleware setup
app.use(express.json());                    // Parse JSON payloads
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(cookieParser());                    // Parse cookies
app.use(methodOverride);                    // Support PUT/DELETE in forms

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'music-player-secret',
  resave: false,                    // Don't save session if unmodified
  saveUninitialized: false,         // Don't create session until something stored
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI || 'mongodb://localhost:27017/music-player',
    collectionName: 'sessions'      // Collection name for sessions
  }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24,   // Session duration: 1 day
    httpOnly: true                  // Prevents client-side access to cookie
  }
}));

// View engine setup
app.set('view engine', 'ejs');              // Use EJS as template engine
app.set('views', path.join(__dirname, 'views')); // Set views directory
app.use(expressLayouts);                    // Enable layout support
app.set('layout', './layouts/main');        // Set default layout

// Session user middleware
app.use(checkSession);                      // Add user to res.locals if logged in

// Content-Type middleware for audio files
app.use((req, res, next) => {
  if (req.url.endsWith('.mp3')) res.setHeader('Content-Type', 'audio/mpeg');
  else if (req.url.endsWith('.wav')) res.setHeader('Content-Type', 'audio/wav');
  else if (req.url.endsWith('.ogg')) res.setHeader('Content-Type', 'audio/ogg');
  next();
});

// Static file serving
app.use(express.static(path.join(__dirname, 'public')));

// Route registration
app.use('/auth', authRoutes);       // Authentication routes
app.use('/songs', songRoutes);      // Song routes
app.use('/playlists', playlistRoutes); // Playlist routes
app.use('/users', userRoutes);      // User routes

// Root route
app.get('/', (req, res) => {
  res.render('index', {
    title: 'Music Player App',
    user: req.session.user || null
  });
});

// Directory setup for uploads (create if not exists)
const uploadDirs = [
  path.join(__dirname, 'public/uploads'),
  path.join(__dirname, 'public/uploads/songs'),
  path.join(__dirname, 'public/uploads/images')
];

uploadDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
});

// Download default assets (non-blocking)
downloadDefaultImages()
  .then(() => console.log('Default images downloaded or already exist'))
  .catch(err => console.error('Error downloading default images:', err));

// Error handling middleware (should be last middleware)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;