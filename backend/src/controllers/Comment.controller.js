const Comment = require("../models/Comment");
const { objectIdToInt } = require("../utils/helpers");

// Mapping function to match frontend JSON server format
const mapCommentToJSONServerFormat = (comment) => {
  return {
    id: objectIdToInt(comment._id),
    blogId: objectIdToInt(
      typeof comment.blog_id === "object"
        ? comment.blog_id._id
        : comment.blog_id
    ),
    userId: objectIdToInt(
      typeof comment.user_id === "object"
        ? comment.user_id._id
        : comment.user_id
    ),
    content: comment.content,
    date: comment.createdAt
      ? new Date(comment.createdAt).toLocaleString("vi-VN")
      : "",
    replyTo: comment.reply_to ? objectIdToInt(comment.reply_to) : undefined,
  };
};

// Get all comments (for json-server compatibility)
exports.getAllComments = async (req, res) => {
  try {
    const { blogId } = req.query;
    let filter = {};

    if (blogId) {
      filter.blog_id = blogId;
    }

    const comments = await Comment.find(filter)
      .populate("user_id", "name")
      .populate("blog_id", "title")
      .sort({ createdAt: -1 });

    const mappedComments = comments.map(mapCommentToJSONServerFormat);
    res.json(mappedComments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create comment (for json-server compatibility)
exports.createComment = async (req, res) => {
  try {
    const comment = new Comment({
      ...req.body,
      blog_id: req.body.blogId,
      user_id: req.body.userId,
      reply_to: req.body.replyTo,
    });

    await comment.save();

    const populatedComment = await Comment.findById(comment._id)
      .populate("user_id", "name")
      .populate("blog_id", "title");

    const mappedComment = mapCommentToJSONServerFormat(populatedComment);
    res.status(201).json(mappedComment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
