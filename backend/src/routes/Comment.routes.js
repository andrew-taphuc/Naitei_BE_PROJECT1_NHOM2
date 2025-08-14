const express = require("express");
const {
  getAllComments,
  createComment,
} = require("../controllers/Comment.controller");

const router = express.Router();

// GET /comments - Get all comments with optional blogId filter
router.get("/", getAllComments);

// POST /comments - Create new comment
router.post("/", createComment);

module.exports = router;
