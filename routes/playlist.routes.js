const express = require("express")
const router = express.Router()
const {
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
  renderEditForm,
} = require("../controllers/playlist.controller")
const { protect } = require("../middlewares/auth.middleware")
const { uploadImage, handleUploadError } = require("../middlewares/upload.middleware")

// Public routes
router.get("/", getAllPlaylists)
router.get("/:id", getPlaylistById)

// Protected routes
router.get("/user/my-playlists", protect, getUserPlaylists)
router.get("/create/new", protect, renderCreateForm)
router.post("/", protect, uploadImage.single("coverImage"), handleUploadError, createPlaylist)
router.get("/:id/edit", protect, renderEditForm)
router.put("/:id", protect, uploadImage.single("coverImage"), handleUploadError, updatePlaylist)
router.delete("/:id", protect, deletePlaylist)
router.post("/:id/songs", protect, addSongToPlaylist)
router.delete("/:id/songs/:songId", protect, removeSongFromPlaylist)
router.put("/:id/cover", protect, uploadImage.single("coverImage"), handleUploadError, uploadCover)

module.exports = router
