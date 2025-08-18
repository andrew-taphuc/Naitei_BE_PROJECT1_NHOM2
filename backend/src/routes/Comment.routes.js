const express = require("express");
const {
  getAllComments,
  createComment,
  deleteComment,
} = require("../controllers/Comment.controller");

const router = express.Router();

// GET /comments - Get all comments with optional blogId filter
router.get("/", getAllComments);

// POST /comments - Create new comment
router.post("/", createComment);

// DELETE /comments/:id - Delete comment
router.delete("/:id", deleteComment);

module.exports = router;
