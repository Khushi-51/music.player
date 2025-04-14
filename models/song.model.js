const mongoose = require('mongoose');

const SongSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  artist: {
    type: String,
    required: true,
    trim: true
  },
  album: {
    type: String,
    trim: true,
    default: 'Single'
  },
  genre: {
    type: String,
    trim: true,
    default: 'Unknown'
  },
  duration: {
    type: Number,
    default: 0
  },
  year: {
    type: Number,
    default: new Date().getFullYear()
  },
  coverImage: {
    type: String,
    default: '/uploads/images/default-cover.png'
  },
  filePath: {
    type: String,
    required: true
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  playCount: {
    type: Number,
    default: 0
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  lyrics: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Create indexes for search functionality
SongSchema.index({ title: 'text', artist: 'text', album: 'text', genre: 'text' });

const Song = mongoose.model('Song', SongSchema);

module.exports = Song;
