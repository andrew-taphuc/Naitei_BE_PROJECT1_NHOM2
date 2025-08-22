const Blog = require("../models/Blog");
const Comment = require("../models/Comment");
const Category = require("../models/Category");
const { getTagIdByName, getTagNameById } = require("../utils/tagMappingSimple");
const { objectIdToInt } = require("../utils/helpers");

// Lấy danh sách blogs (có phân trang, lọc category, tag)
exports.getAllBlogs = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, tag } = req.query;
    const filter = {};
    if (category) filter.categories = { $in: [category] };
    if (tag) filter.tags = { $in: [tag] };

    const blogs = await Blog.find(filter)
      .populate("categories", "name")
      .populate("author_id", "name email")
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    // Transform to JSON server compatible format
    const transformedBlogs = await Promise.all(
      blogs.map(async (blog) => {
        // Get comments for this blog
        const comments = await Comment.find({ blog_id: blog._id })
          .populate("user_id", "full_name")
          .sort({ created_at: 1 });

        const transformedComments = comments.map((comment) => ({
          id: objectIdToInt(comment._id),
          blogId: objectIdToInt(comment.blog_id),
          userId: comment.user_id ? objectIdToInt(comment.user_id._id) : null,
          userName: comment.user_id?.full_name || "Anonymous",
          content: comment.content,
          date: comment.created_at
            ? new Date(comment.created_at).toLocaleDateString("vi-VN")
            : "",
          replyTo: comment.reply_to
            ? objectIdToInt(comment.reply_to)
            : undefined,
        }));

        return {
          id: objectIdToInt(blog._id),
          title: blog.title,
          description: blog.description,
          contents: blog.contents,
          images: blog.images,
          categories: blog.categories.map((cat) => cat._id.toString()),
          tags: blog.tags
            .map((tagName) => getTagIdByName(tagName))
            .filter((id) => id !== null),
          date: blog.createdAt
            ? new Date(blog.createdAt).toLocaleDateString("vi-VN", {
                weekday: "long",
                year: "numeric",
                month: "numeric",
                day: "numeric",
              })
            : "",
          created_at: blog.createdAt
            ? new Date(blog.createdAt).toLocaleTimeString("vi-VN")
            : "",
          comments: transformedComments,
        };
      })
    );

    // Return as array for JSON server compatibility
    return res.json(transformedBlogs);
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

    // Get comments for this blog
    const comments = await Comment.find({ blog_id: blog._id })
      .populate("user_id", "full_name")
      .sort({ created_at: 1 });

    const transformedComments = comments.map((comment) => ({
      id: objectIdToInt(comment._id),
      blogId: objectIdToInt(comment.blog_id),
      userId: objectIdToInt(comment.user_id._id),
      userName: comment.user_id.full_name,
      content: comment.content,
      date: comment.created_at
        ? new Date(comment.created_at).toLocaleDateString("vi-VN")
        : "",
      replyTo: comment.reply_to ? objectIdToInt(comment.reply_to) : undefined,
    }));

    // Transform to JSON server compatible format
    const transformedBlog = {
      id: objectIdToInt(blog._id),
      title: blog.title,
      description: blog.description,
      contents: blog.contents,
      images: blog.images,
      categories: blog.categories.map((cat) => objectIdToInt(cat._id)),
      tags: blog.tags
        .map((tagName) => getTagIdByName(tagName))
        .filter((id) => id !== null),
      date: blog.createdAt
        ? new Date(blog.createdAt).toLocaleDateString("vi-VN", {
            weekday: "long",
            year: "numeric",
            month: "numeric",
            day: "numeric",
          })
        : "",
      created_at: blog.createdAt
        ? new Date(blog.createdAt).toLocaleTimeString("vi-VN")
        : "",
      comments: transformedComments,
    };

    return res.json(transformedBlog);
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
      .flatMap((tag) =>
        tag
          .split(",")
          .map((t) => t.trim())
          .filter((t) => t)
      );
    const uniqueTags = [...new Set(tagList)];
    res.json(uniqueTags);
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
