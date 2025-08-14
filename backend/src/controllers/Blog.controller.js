const Blog = require("../models/Blog");
const Comment = require("../models/Comment");
const Category = require("../models/Category");
const { getTagIdByName, getTagNameById } = require("../utils/tagMappingSimple");

// Helper function to convert ObjectId to consistent integer
const objectIdToInt = (objectId) => {
  if (!objectId) return null;
  const str = objectId.toString();
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash) % 1000000; // Keep it reasonably sized
};

// Mapping functions to match frontend JSON server format
const mapBlogToJSONServerFormat = (blog) => {
  const tagIds =
    blog.tags && blog.tags.length > 0
      ? blog.tags
          .map((tag) => {
            if (typeof tag === "string") {
              return getTagIdByName(tag) || 0;
            }
            return typeof tag === "object" ? objectIdToInt(tag._id) : tag;
          })
          .filter((id) => id !== 0) // Remove invalid tag IDs
      : [];

  return {
    id: objectIdToInt(blog._id),
    title: blog.title,
    description: blog.description,
    contents: blog.contents,
    images: blog.images || [],
    categories: blog.categories
      ? blog.categories.map((cat) =>
          objectIdToInt(typeof cat === "object" ? cat._id : cat)
        )
      : [],
    tags: tagIds,
    date: blog.createdAt
      ? new Date(blog.createdAt).toLocaleDateString("vi-VN", {
          weekday: "long",
          day: "numeric",
          month: "numeric",
          year: "numeric",
        })
      : "",
    created_at: blog.createdAt
      ? new Date(blog.createdAt).toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        })
      : "",
    comments: [], // Will be populated separately
  };
};

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

const mapCategoryToJSONServerFormat = (category) => {
  return {
    id: objectIdToInt(category._id),
    name: category.name,
  };
};

const mapTagToJSONServerFormat = (tag) => {
  return {
    id: objectIdToInt(tag._id ? tag._id : tag.toString()),
    name: tag.name || tag,
  };
};

// Lấy danh sách blogs (có phân trang, lọc category, tag)
exports.getAllBlogs = async (req, res) => {
  try {
    const { page = 1, limit = 1000, category, tag } = req.query; // Default large limit to get all
    const filter = {};
    if (category) filter.categories = { $in: [category] };
    if (tag) {
      // Convert tag ID to tag name for database filtering
      const tagName = await getTagNameById(tag);
      if (tagName) {
        filter.tags = { $in: [tagName] };
      }
    }

    const blogs = await Blog.find(filter)
      .populate("categories", "name")
      .populate("author_id", "name email")
      .sort({ createdAt: -1 });

    // Map to JSON server format (back to sync)
    const mappedBlogs = blogs.map(mapBlogToJSONServerFormat);

    // For each blog, get comment IDs
    for (let blog of mappedBlogs) {
      // Use original _id for DB query, not the mapped integer id
      const originalBlog = blogs.find((b) => objectIdToInt(b._id) === blog.id);
      if (originalBlog) {
        const comments = await Comment.find({
          blog_id: originalBlog._id,
        }).select("_id");
        blog.comments = comments.map((c) => objectIdToInt(c._id));
      }
    }

    // Return direct array like json-server
    return res.status(200).json(mappedBlogs);
  } catch (error) {
    console.error("Error fetching blogs:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Lấy chi tiết blog
exports.getBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id)
      .populate("categories", "name")
      .populate("author_id", "name email");

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    // Map to JSON server format and return directly (back to sync)
    const mappedBlog = mapBlogToJSONServerFormat(blog);

    // Get comment IDs for this blog
    const comments = await Comment.find({ blog_id: blog._id }).select("_id");
    mappedBlog.comments = comments.map((c) => objectIdToInt(c._id));

    return res.status(200).json(mappedBlog);
  } catch (error) {
    console.error("Error fetching blog:", error);

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid blog ID format",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Tạo blog mới
exports.createBlog = async (req, res) => {
  try {
    const blog = new Blog(req.body);
    const savedBlog = await blog.save();

    // Populate để trả về thông tin đầy đủ
    const populatedBlog = await Blog.findById(savedBlog._id)
      .populate("categories", "name")
      .populate("author_id", "name email");

    return res.status(201).json({
      success: true,
      message: "Blog created successfully",
      data: populatedBlog,
    });
  } catch (error) {
    console.error("Error creating blog:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: error.errors,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Cập nhật blog
exports.updateBlog = async (req, res) => {
  try {
    const blog = await Blog.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate("categories", "name")
      .populate("author_id", "name email");

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Blog updated successfully",
      data: blog,
    });
  } catch (error) {
    console.error("Error updating blog:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: error.errors,
      });
    }

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid blog ID format",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Xóa blog
exports.deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);
    if (!blog) return res.status(404).json({ error: "Blog not found" });
    res.json({
      success: true,
      message: "Blog deleted successfully",
      deletedId: req.params.id,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

// Lấy comments của blog
exports.getBlogComments = async (req, res) => {
  try {
    const comments = await Comment.find({ blog_id: req.params.id })
      .populate("user_id", "name")
      .populate("reply_to")
      .sort({ created_at: -1 });
    res.json(comments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Thêm comment vào blog
exports.addBlogComment = async (req, res) => {
  try {
    const comment = new Comment({
      ...req.body,
      blog_id: req.params.id,
    });
    await comment.save();
    const populatedComment = await Comment.findById(comment._id).populate(
      "user_id",
      "name"
    );
    res.status(201).json({
      success: true,
      message: "Comment added successfully",
      data: populatedComment,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message,
    });
  }
};

// Lấy danh sách categories cho blog
exports.getBlogCategories = async (req, res) => {
  try {
    const categories = await Category.find({ type: "blog" });
    const mappedCategories = categories.map(mapCategoryToJSONServerFormat);
    res.json(mappedCategories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Lấy danh sách tất cả tags
exports.getAllTags = async (req, res) => {
  try {
    const tags = await Blog.distinct("tags");
    const tagList = tags
      .filter((tag) => tag)
      .flatMap((tag) => (Array.isArray(tag) ? tag : [tag]))
      .filter((t) => t);

    // Create JSON server format for tags
    const uniqueTags = [...new Set(tagList)];
    const mappedTags = uniqueTags.map((tag, index) => ({
      id: (index + 1).toString(),
      name: tag,
    }));

    res.json(mappedTags);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Sửa comment
exports.updateComment = async (req, res) => {
  try {
    const comment = await Comment.findByIdAndUpdate(
      req.params.commentId,
      req.body,
      { new: true }
    ).populate("user_id", "name");
    if (!comment) return res.status(404).json({ error: "Comment not found" });
    res.json(comment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Xóa comment
exports.deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findByIdAndDelete(req.params.commentId);
    if (!comment) return res.status(404).json({ error: "Comment not found" });
    res.json({
      success: true,
      message: "Comment deleted successfully",
      deletedId: req.params.commentId,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};
