const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const createDirIfNotExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// Create necessary directories
createDirIfNotExists(path.join(__dirname, '../public/uploads/songs'));
createDirIfNotExists(path.join(__dirname, '../public/uploads/images'));

// Configure song storage
const songStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../public/uploads/songs'));
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const timestamp = Date.now();
    const originalName = file.originalname.toLowerCase().split(' ').join('-');
    cb(null, `${timestamp}-${originalName}`);
  }
});

// Configure image storage
const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../public/uploads/images'));
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const timestamp = Date.now();
    const originalName = file.originalname.toLowerCase().split(' ').join('-');
    cb(null, `${timestamp}-${originalName}`);
  }
});

// File filter for songs
const songFilter = (req, file, cb) => {
  const allowedMimeTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg'];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only MP3, WAV, and OGG audio files are allowed.'), false);
  }
};

// File filter for images
const imageFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPG, PNG, and GIF image files are allowed.'), false);
  }
};

// Create multer upload instances
const uploadSong = multer({
  storage: songStorage,
  fileFilter: songFilter,
  limits: {
    fileSize: 20 * 1024 * 1024 // 20MB limit
  }
});

const uploadImage = multer({
  storage: imageStorage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Middleware to handle file upload errors
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: true,
        message: 'File is too large. Maximum size for songs is 20MB and images is 5MB.'
      });
    }
    return res.status(400).json({ error: true, message: err.message });
  }

  if (err) {
    return res.status(400).json({ error: true, message: err.message });
  }

  next();
};

module.exports = {
  uploadSong,
  uploadImage,
  handleUploadError
};
