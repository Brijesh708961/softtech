const express = require("express");
const router = express.Router();
const upload = require("../config/upload");
const { isAuthenticated } = require("../middleware/authMiddleware");

router.post("/", isAuthenticated, upload.single("image"), (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "No file uploaded" });
    }
    res.status(200).json({
      success: true,
      url: req.file.path, // Cloudinary URL
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
