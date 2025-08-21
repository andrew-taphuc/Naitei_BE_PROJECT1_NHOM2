// Controller: Upload image to Cloudinary from backend
const cloudinary = require("cloudinary").v2;
const dotenv = require("dotenv");
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

exports.uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "No file uploaded" });
    }
    cloudinary.uploader
      .upload_stream({ resource_type: "image" }, (error, result) => {
        if (error) {
          console.error("Cloudinary upload error:", error);
          return res
            .status(500)
            .json({
              success: false,
              message: "Cloudinary upload error",
              error,
            });
        }
        return res.json({ success: true, url: result.secure_url });
      })
      .end(req.file.buffer);
  } catch (err) {
    console.error("Server error:", err);
    if (!res.headersSent) {
      res
        .status(500)
        .json({ success: false, message: "Server error", error: err });
    }
  }
};
