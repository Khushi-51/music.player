const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const Song = require('../models/song.model');

const {
  getAllSongs,
  getSongById,
  createSong,
  updateSong,
  deleteSong,
  uploadCover,
  renderUploadForm,
  renderEditForm
} = require('../controllers/song.controller');
const { protect } = require('../middlewares/auth.middleware');
const { uploadSong, uploadImage, handleUploadError } = require('../middlewares/upload.middleware');

// Search route (specific, defined first)
router.get('/search', async (req, res) => {
  try {
    const searchTerm = req.query.q;
    const limit = parseInt(req.query.limit) || 5;

    if (!searchTerm || searchTerm.trim() === '') {
      return res.status(400).json({ success: false, error: 'Search term is required' });
    }

    const songs = await Song.find({
      $or: [
        { title: { $regex: searchTerm, $options: 'i' }},
        { artist: { $regex: searchTerm, $options: 'i' }}
      ]
    }).limit(limit);

    res.json({ success: true, data: songs });
  } catch (error) {
    console.error('Error in /search:', error);
    res.status(500).json({ success: false, error: 'Failed to search songs' });
  }
});

// Public routes
router.get('/', getAllSongs);
router.get('/:id', getSongById);

// Protected routes
router.get('/upload/new', protect, renderUploadForm);
router.post('/', protect, uploadSong.single('songFile'), handleUploadError, createSong);
router.get('/:id/edit', protect, renderEditForm);
router.put('/:id', protect, updateSong);
router.put('/:id/cover', protect, uploadImage.single('coverImage'), handleUploadError, uploadCover);

// Explicit DELETE route (using POST for server-side rendering)
router.post('/:id/delete', protect, async (req, res, next) => {
  try {
    const song = await Song.findById(req.params.id);

    if (!song) {
      return res.status(404).render('error', {
        title: 'Song Not Found',
        message: 'The requested song does not exist'
      });
    }

    // Check if user is the owner or admin
    if (song.uploadedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).render('error', {
        title: 'Access Denied',
        message: 'You are not authorized to delete this song'
      });
    }

    // Delete song file from server
    const filePath = path.join(__dirname, '../public', song.filePath);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete song from database
    await song.deleteOne();

    // Check if the request expects JSON (API) or a redirect (server-side form)
    const wantsJson = req.xhr || req.headers.accept.includes('json');
    if (wantsJson) {
      return res.json({ success: true, message: 'Song deleted successfully' });
    }
    return res.redirect('/songs');
  } catch (error) {
    console.error('Error in /:id/delete:', error);
    next(error);
  }
});

module.exports = router;