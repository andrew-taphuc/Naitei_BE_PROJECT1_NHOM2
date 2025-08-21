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
    userId:
      typeof comment.user_id === "object"
        ? comment.user_id._id.toString()
        : comment.user_id.toString(),
    userName:
      typeof comment.user_id === "object" &&
      (comment.user_id.full_name || comment.user_id.fullName)
        ? comment.user_id.full_name || comment.user_id.fullName
        : "",
    content: comment.content,
    date: comment.created_at
      ? (() => {
          // Nếu là ISO string thì format lại
          if (typeof comment.created_at === "string") {
            // Nếu là ISO string thì format lại
            const d = new Date(comment.created_at);
            if (!isNaN(d.getTime())) {
              return d.toLocaleDateString("vi-VN");
            }
            // Nếu là string nhưng không phải ISO thì trả về luôn
            return comment.created_at;
          }
          // Nếu là Date object
          if (comment.created_at instanceof Date) {
            return comment.created_at.toLocaleDateString("vi-VN");
          }
          // Nếu là bất kỳ kiểu gì khác
          return String(comment.created_at);
        })()
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
      .populate("user_id", "full_name")
      .populate("blog_id", "title")
      .sort({ created_at: -1 });

    const mappedComments = comments.map(mapCommentToJSONServerFormat);
    res.json(mappedComments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create comment (for json-server compatibility)
exports.createComment = async (req, res) => {
  try {
    const { blogId, userId, content, replyTo } = req.body;

    // Debug logging
    console.log("CREATE COMMENT REQUEST:", {
      blogId,
      userId,
      content: content?.substring(0, 50),
      replyTo,
      body: req.body,
    });

    // Find actual ObjectIds by matching the hashed integer IDs
    const Blog = require("../models/Blog");
    const User = require("../models/User");

    // Find blog and user that hash to the provided integer IDs
    const blogs = await Blog.find({}).lean();
    const users = await User.find({}).lean();

    let blog, user;

    // Handle both integer and ObjectId string for blogId
    if (typeof blogId === "string" && blogId.length === 24) {
      // If blogId is ObjectId string, find by _id
      blog = blogs.find((b) => b._id.toString() === blogId);
    } else {
      // If blogId is integer, find by hashed ID
      blog = blogs.find((b) => objectIdToInt(b._id) === parseInt(blogId));
    }

    // Handle both integer and ObjectId string for userId
    if (typeof userId === "string" && userId.length === 24) {
      // If userId is ObjectId string, find by _id
      user = users.find((u) => u._id.toString() === userId);
    } else {
      // If userId is integer, find by hashed ID
      user = users.find((u) => objectIdToInt(u._id) === parseInt(userId));
    }

    if (!blog) {
      return res
        .status(400)
        .json({ error: `Blog with ID ${blogId} not found` });
    }
    if (!user) {
      return res
        .status(400)
        .json({ error: `User with ID ${userId} not found` });
    }

    let replyToObjectId = null;
    if (replyTo) {
      const comments = await Comment.find({}).lean();
      let replyComment;

      // Handle both integer and ObjectId string for replyTo
      if (typeof replyTo === "string" && replyTo.length === 24) {
        // If replyTo is ObjectId string, find by _id
        replyComment = comments.find((c) => c._id.toString() === replyTo);
      } else {
        // If replyTo is integer, find by hashed ID
        replyComment = comments.find(
          (c) => objectIdToInt(c._id) === parseInt(replyTo)
        );
      }

      if (replyComment) {
        replyToObjectId = replyComment._id;
      }
    }

    const comment = new Comment({
      blog_id: blog._id,
      user_id: user._id,
      content,
      reply_to: replyToObjectId,
    });

    await comment.save();

    const populatedComment = await Comment.findById(comment._id)
      .populate("user_id", "full_name")
      .populate("blog_id", "title");

    const mappedComment = mapCommentToJSONServerFormat(populatedComment);
    console.log("RESPONSE COMMENT:", mappedComment);
    res.status(201).json(mappedComment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete comment
exports.deleteComment = async (req, res) => {
  try {
    const { id } = req.params;

    console.log("DELETE COMMENT REQUEST:", { id });

    // Find comment by both integer and ObjectId string
    const comments = await Comment.find({}).lean();
    let comment;

    if (typeof id === "string" && id.length === 24) {
      // If id is ObjectId string, find by _id
      comment = comments.find((c) => c._id.toString() === id);
    } else {
      // If id is integer, find by hashed ID
      comment = comments.find((c) => objectIdToInt(c._id) === parseInt(id));
    }

    if (!comment) {
      return res.status(404).json({ error: `Comment with ID ${id} not found` });
    }

    // Delete the comment
    await Comment.findByIdAndDelete(comment._id);

    // Also delete all replies to this comment
    await Comment.deleteMany({ reply_to: comment._id });

    res.status(200).json({
      message: "Comment deleted successfully",
      id: objectIdToInt(comment._id),
    });
  } catch (err) {
    console.error("Error deleting comment:", err);
    res.status(400).json({ error: err.message });
  }
};
