const express = require("express")
const router = express.Router()
const User = require("../models/user.model")
const { protect, admin } = require("../middlewares/auth.middleware")
const { uploadImage, handleUploadError } = require("../middlewares/upload.middleware")
const path = require("path")
const fs = require("fs")

// Get user profile
router.get("/profile", protect, (req, res) => {
  res.render("users/profile", {
    title: "My Profile",
    user: req.session.user,
  })
})

// Update user profile
router.put("/profile", protect, uploadImage.single("profileImage"), handleUploadError, async (req, res, next) => {
  try {
    const { bio } = req.body
    const updateData = { bio }

    // If profile image was uploaded
    if (req.file) {
      // Delete old profile image if it's not the default
      if (req.user.profileImage && req.user.profileImage !== "/uploads/images/default-profile.png") {
        const oldImagePath = path.join(__dirname, "../public", req.user.profileImage)
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath)
        }
      }

      // Set new profile image
      updateData.profileImage = `/uploads/images/${req.file.filename}`
    }

    // Update user in database
    const updatedUser = await User.findByIdAndUpdate(req.user._id, updateData, { new: true }).select("-password")

    // Update session user
    req.session.user = {
      _id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      profileImage: updatedUser.profileImage,
      bio: updatedUser.bio,
      role: updatedUser.role,
    }

    // Redirect back to profile
    res.redirect("/users/profile")
  } catch (error) {
    next(error)
  }
})

module.exports = router
