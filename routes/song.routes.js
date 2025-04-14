const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const Song = require('../models/song.model'); // Add this import

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

// Public routes
router.get('/', getAllSongs);
router.get('/:id', getSongById);

// Protected routes
router.get('/upload/new', protect, renderUploadForm);
router.post('/', protect, uploadSong.single('songFile'), handleUploadError, createSong);
router.get('/:id/edit', protect, renderEditForm);
router.put('/:id', protect, updateSong);
// router.delete('/:id', protect, deleteSong);
router.put('/:id/cover', protect, uploadImage.single('coverImage'), handleUploadError, uploadCover);

// Add this to your song.routes.js file - an explicit DELETE route
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

    // Redirect to songs list
    return res.redirect('/songs');
  } catch (error) {
    next(error);
  }
});

module.exports = router;