const fs = require('fs');
const path = require('path');
const Playlist = require('../models/playlist.model');
const Song = require('../models/song.model');
const User = require('../models/user.model');

/**
 * @desc    Get all playlists with pagination
 * @route   GET /playlists
 * @access  Public
 */
const getAllPlaylists = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get total playlists count for pagination
    const totalPlaylists = await Playlist.countDocuments({ isPublic: true });

    // Find playlists with filters, pagination and population
    const playlists = await Playlist.find({ isPublic: true })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('createdBy', 'username');

    // Determine response based on content type
    if (req.accepts('html')) {
      return res.render('playlists/index', {
        title: 'All Playlists',
        playlists,
        user: req.session.user || null
      });
    }

    // API response
    res.status(200).json({ success: true, data: playlists });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user's playlists
 * @route   GET /playlists/my-playlists
 * @access  Private
 */
const getUserPlaylists = async (req, res, next) => {
  try {
    const playlists = await Playlist.find({ createdBy: req.user._id })
      .sort({ createdAt: -1 });

    // Determine response based on content type
    if (req.accepts('html')) {
      return res.render('playlists/my-playlists', {
        title: 'My Playlists',
        playlists,
        user: req.session.user
      });
    }

    // API response
    res.status(200).json({ success: true, data: playlists });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get playlist by ID
 * @route   GET /playlists/:id
 * @access  Public/Private (depending on playlist visibility)
 */
const getPlaylistById = async (req, res, next) => {
  try {
    const playlist = await Playlist.findById(req.params.id)
      .populate('createdBy', 'username')
      .populate('songs');

    if (!playlist) {
      return res.status(404).json({ error: true, message: 'Playlist not found' });
    }

    // Check if playlist is private and user is not the owner
    if (!playlist.isPublic &&
        (!req.user || playlist.createdBy._id.toString() !== req.user._id.toString())) {
      return res.status(403).json({ error: true, message: 'This playlist is private' });
    }

    // Determine response based on content type
    if (req.accepts('html')) {
      return res.render('playlists/detail', {
        title: playlist.name,
        playlist,
        user: req.session.user || null
      });
    }

    // API response
    res.status(200).json({ success: true, data: playlist });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new playlist
 * @route   POST /playlists
 * @access  Private
 */
const createPlaylist = async (req, res, next) => {
  try {
    const { name, description, isPublic } = req.body;

    // Create new playlist
    const playlist = await Playlist.create({
      name,
      description,
      isPublic: isPublic === 'true' || isPublic === true,
      user: req.user._id,
      createdBy: req.user._id
    });

    // Determine response based on content type
    if (req.accepts('html')) {
      return res.redirect(`/playlists/${playlist._id}`);
    }

    // API response
    res.status(201).json({ success: true, data: playlist });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update playlist details
 * @route   PUT /playlists/:id
 * @access  Private
 */
const updatePlaylist = async (req, res, next) => {
  try {
    let playlist = await Playlist.findById(req.params.id);

    if (!playlist) {
      return res.status(404).json({ error: true, message: 'Playlist not found' });
    }

    // Check if user is the owner
    if (playlist.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: true, message: 'Not authorized to update this playlist' });
    }

    // Update playlist with new data
    playlist = await Playlist.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );

    // Determine response based on content type
    if (req.accepts('html')) {
      return res.redirect(`/playlists/${playlist._id}`);
    }

    // API response
    res.status(200).json({ success: true, data: playlist });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a playlist
 * @route   DELETE /playlists/:id
 * @access  Private
 */
const deletePlaylist = async (req, res, next) => {
  try {
    const playlist = await Playlist.findById(req.params.id);

    if (!playlist) {
      return res.status(404).json({ error: true, message: 'Playlist not found' });
    }

    // Check if user is the owner
    if (playlist.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: true, message: 'Not authorized to delete this playlist' });
    }

    // Delete playlist from database
    await playlist.deleteOne();

    // Determine response based on content type
    if (req.accepts('html')) {
      return res.redirect('/playlists');
    }

    // API response
    res.status(200).json({ success: true, message: 'Playlist deleted successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add song to playlist
 * @route   POST /playlists/:id/songs
 * @access  Private
 */
const addSongToPlaylist = async (req, res, next) => {
  try {
    const { songId } = req.body;

    // Find playlist and song
    const playlist = await Playlist.findById(req.params.id);
    const song = await Song.findById(songId);

    if (!playlist || !song) {
      return res.status(404).json({ error: true, message: 'Playlist or song not found' });
    }

    // Check if user is the owner
    if (playlist.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: true, message: 'Not authorized to update this playlist' });
    }

    // Add song to playlist if not already added
    if (!playlist.songs.includes(songId)) {
      playlist.songs.push(songId);
      await playlist.save();
    }

    // Redirect to playlist page for HTML requests
    if (req.accepts('html')) {
      return res.redirect(`/playlists/${playlist._id}`);
    }

    // API response
    res.status(200).json({ success: true, data: playlist });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Remove song from playlist
 * @route   DELETE /playlists/:id/songs/:songId
 * @access  Private
 */
const removeSongFromPlaylist = async (req, res, next) => {
  try {
    const playlist = await Playlist.findById(req.params.id);

    if (!playlist) {
      return res.status(404).json({ error: true, message: 'Playlist not found' });
    }

    // Check if user is the owner
    if (playlist.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: true, message: 'Not authorized to update this playlist' });
    }

    // Remove song from playlist
    playlist.songs = playlist.songs.filter(song => song.toString() !== req.params.songId);
    await playlist.save();

    // Redirect to playlist page for HTML requests
    if (req.accepts('html')) {
      return res.redirect(`/playlists/${playlist._id}`);
    }

    // API response
    res.status(200).json({ success: true, data: playlist });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Upload playlist cover image
 * @route   PUT /playlists/:id/cover
 * @access  Private
 */
const uploadCover = async (req, res, next) => {
  try {
    const playlist = await Playlist.findById(req.params.id);

    if (!playlist) {
      return res.status(404).json({ error: true, message: 'Playlist not found' });
    }

    // Check if user is the owner
    if (playlist.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: true, message: 'Not authorized to update this playlist' });
    }

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ error: true, message: 'Please upload an image file' });
    }

    // Update playlist with new cover image
    const coverImage = `/uploads/images/${req.file.filename}`;
    playlist.coverImage = coverImage;
    await playlist.save();

    // Redirect to playlist page for HTML requests
    if (req.accepts('html')) {
      return res.redirect(`/playlists/${playlist._id}`);
    }

    // API response
    res.status(200).json({ success: true, data: playlist });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Render create playlist form
 * @route   GET /playlists/create
 * @access  Private
 */
const renderCreateForm = (req, res) => {
  res.render('playlists/create', {
    title: 'Create Playlist',
    user: req.session.user
  });
};

/**
 * @desc    Render edit playlist form
 * @route   GET /playlists/:id/edit
 * @access  Private
 */
const renderEditForm = async (req, res, next) => {
  try {
    const playlist = await Playlist.findById(req.params.id);

    if (!playlist) {
      return res.status(404).render('error', {
        title: 'Playlist Not Found',
        message: 'The requested playlist does not exist'
      });
    }

    // Check if user is the owner
    if (playlist.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).render('error', {
        title: 'Access Denied',
        message: 'You are not authorized to edit this playlist'
      });
    }

    res.render('playlists/edit', {
      title: `Edit ${playlist.name}`,
      playlist,
      user: req.session.user
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllPlaylists,
  getUserPlaylists,
  getPlaylistById,
  createPlaylist,
  updatePlaylist,
  deletePlaylist,
  addSongToPlaylist,
  removeSongFromPlaylist,
  uploadCover,
  renderCreateForm,
  renderEditForm
};
