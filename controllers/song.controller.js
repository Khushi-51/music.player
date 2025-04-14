const fs = require('fs');
const path = require('path');
const Song = require('../models/song.model');

/**
 * @desc    Get all songs with pagination
 * @route   GET /songs
 * @access  Public
 */
const getAllSongs = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Query parameters for filtering
    const { search, genre, artist } = req.query;
    const filter = {};

    // Add search filter if provided
    if (search) {
      filter.$text = { $search: search };
    }

    // Add genre filter if provided
    if (genre) {
      filter.genre = genre;
    }

    // Add artist filter if provided
    if (artist) {
      filter.artist = artist;
    }

    // Get total songs count for pagination
    const totalSongs = await Song.countDocuments(filter);

    // Find songs with filters, pagination and population
    const songs = await Song.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('uploadedBy', 'username profileImage');

    // Calculate pagination details
    const totalPages = Math.ceil(totalSongs / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    // Determine response based on content type
    if (req.accepts('html')) {
      return res.render('songs/index', {
        title: 'All Songs',
        songs,
        pagination: {
          page,
          limit,
          totalSongs,
          totalPages,
          hasNextPage,
          hasPrevPage
        },
        filters: {
          search,
          genre,
          artist
        },
        user: req.session.user || null
      });
    }

    // API response
    res.status(200).json({
      success: true,
      count: songs.length,
      pagination: {
        page,
        limit,
        totalSongs,
        totalPages,
        hasNextPage,
        hasPrevPage
      },
      data: songs
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get song by ID
 * @route   GET /songs/:id
 * @access  Public
 */
// ...existing code...
// ...existing code...
const getSongById = async (req, res, next) => {
  try {
    console.log('Looking for song with ID:', req.params.id);
    
    const song = await Song.findById(req.params.id)
      .populate('uploadedBy', 'username profileImage');

    if (!song) {
      console.log('Song not found in database for ID:', req.params.id);
      return res.status(404).json({ error: true, message: 'Song not found' });
    }

    console.log('Song found:', song.title);
    
    // Check if the song file exists
    const filePath = path.join(__dirname, '../public', song.filePath);
    console.log('Checking file at path:', filePath);
    
    if (!fs.existsSync(filePath)) {
      console.log('Song file not found at path:', filePath);
      return res.status(404).json({ error: true, message: 'Song file not found on server' });
    }
    
    // Increment play count
    song.playCount += 1;
    await song.save();

    // Get similar songs
    const similarSongs = await Song.find({ 
      _id: { $ne: song._id }, 
      genre: song.genre
    })
    .limit(6)
    .populate('uploadedBy', 'username profileImage');

    // Determine response based on content type
    if (req.accepts('html')) {
      return res.render('songs/detail', {
        title: song.title,
        song,
        songs: similarSongs || [],
        user: req.session.user || null
      });
    }

    // API response
    res.status(200).json({
      success: true,
      data: song
    });
  } catch (error) {
    console.error('Error in getSongById:', error);
    next(error);
  }
};
// ...existing code...
// ...existing code...
/**
 * @desc    Create a new song
 * @route   POST /songs
 * @access  Private
 */
const createSong = async (req, res, next) => {
  try {
    // Get song details from request body
    const { title, artist, album, genre, year } = req.body;

    // Check if song file was uploaded
    if (!req.file) {
      return res.status(400).json({ error: true, message: 'Please upload a song file' });
    }

    // Create relative path for file
    const filePath = `/uploads/songs/${req.file.filename}`;

    // Create new song
    const song = await Song.create({
      title,
      artist,
      album,
      genre,
      year,
      filePath,
      uploadedBy: req.user._id
    });

    // Determine response based on content type
    if (req.accepts('html')) {
      return res.redirect(`/songs/${song._id}`);
    }

    // API response
    res.status(201).json({
      success: true,
      data: song
    });
  } catch (error) {
    // If error occurs, remove uploaded file
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    next(error);
  }
};

/**
 * @desc    Update song details
 * @route   PUT /songs/:id
 * @access  Private
 */
const updateSong = async (req, res, next) => {
  try {
    let song = await Song.findById(req.params.id);

    if (!song) {
      return res.status(404).json({ error: true, message: 'Song not found' });
    }

    // Check if user is the owner or admin
    if (song.uploadedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: true, message: 'Not authorized to update this song' });
    }

    // Update song with new data
    song = await Song.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    // Determine response based on content type
    if (req.accepts('html')) {
      return res.redirect(`/songs/${song._id}`);
    }

    // API response
    res.status(200).json({
      success: true,
      data: song
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a song
 * @route   DELETE /songs/:id
 * @access  Private
 */
const deleteSong = async (req, res, next) => {
  try {
    const song = await Song.findById(req.params.id);

    if (!song) {
      return res.status(404).json({ error: true, message: 'Song not found' });
    }

    // Check if user is the owner or admin
    if (song.uploadedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: true, message: 'Not authorized to delete this song' });
    }

    // Delete song file from server
    const filePath = path.join(__dirname, '../public', song.filePath);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete song from database
    await song.deleteOne();

    // Determine response based on content type
    if (req.accepts('html')) {
      return res.redirect('/songs');
    }

    // API response
    res.status(200).json({
      success: true,
      message: 'Song deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Upload song cover image
 * @route   PUT /songs/:id/cover
 * @access  Private
 */
const uploadCover = async (req, res, next) => {
  try {
    let song = await Song.findById(req.params.id);

    if (!song) {
      return res.status(404).json({ error: true, message: 'Song not found' });
    }

    // Check if user is the owner or admin
    if (song.uploadedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: true, message: 'Not authorized to update this song' });
    }

    // Check if image file was uploaded
    if (!req.file) {
      return res.status(400).json({ error: true, message: 'Please upload an image file' });
    }

    // Delete old cover image if it exists and is not the default
    if (song.coverImage && song.coverImage !== '/uploads/images/default-cover.png') {
      const oldCoverPath = path.join(__dirname, '../public', song.coverImage);
      if (fs.existsSync(oldCoverPath)) {
        fs.unlinkSync(oldCoverPath);
      }
    }

    // Update song with new cover image
    const coverImage = `/uploads/images/${req.file.filename}`;

    song = await Song.findByIdAndUpdate(
      req.params.id,
      { coverImage },
      { new: true }
    );

    // Determine response based on content type
    if (req.accepts('html')) {
      return res.redirect(`/songs/${song._id}`);
    }

    // API response
    res.status(200).json({
      success: true,
      data: song
    });
  } catch (error) {
    // If error occurs, remove uploaded file
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    next(error);
  }
};

/**
 * @desc    Render upload song form
 * @route   GET /songs/upload
 * @access  Private
 */
const renderUploadForm = (req, res) => {
  res.render('songs/upload', {
    title: 'Upload Song',
    user: req.session.user
  });
};

/**
 * @desc    Render edit song form
 * @route   GET /songs/:id/edit
 * @access  Private
 */
const renderEditForm = async (req, res, next) => {
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
        message: 'You are not authorized to edit this song'
      });
    }

    res.render('songs/edit', {
      title: `Edit ${song.title}`,
      song,
      user: req.session.user
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllSongs,
  getSongById,
  createSong,
  updateSong,
  deleteSong,
  uploadCover,
  renderUploadForm,
  renderEditForm
};
