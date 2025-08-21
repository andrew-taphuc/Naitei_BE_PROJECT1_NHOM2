const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer();
const { uploadImage } = require("../controllers/Cloudinary.controller");

// POST /api/upload-image
router.post("/upload-image", upload.single("file"), uploadImage);

module.exports = router;
