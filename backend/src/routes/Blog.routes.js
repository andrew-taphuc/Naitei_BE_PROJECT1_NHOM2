const express = require("express");
const router = express.Router();
const {
  getAllBlogs,
  getBlog,
  createBlog,
  updateBlog,
  deleteBlog,
  getBlogComments,
  addBlogComment,
  getBlogCategories,
  getAllTags,
  updateComment,
  deleteComment,
} = require("../controllers/Blog.controller");

// Categories và Tags routes (phải đặt TRƯỚC /:id)
router.get("/categories", getBlogCategories);
router.get("/tags", getAllTags);

// Lấy danh sách blogs
router.get("/", getAllBlogs);
// Lấy chi tiết blog
router.get("/:id", getBlog);
// Tạo blog mới
router.post("/", createBlog);
// Cập nhật blog
router.put("/:id", updateBlog);
// Xóa blog
router.delete("/:id", deleteBlog);

// Comments routes
router.get("/:id/comments", getBlogComments);
router.post("/:id/comments", addBlogComment);

// Comment management routes
router.put("/comments/:commentId", updateComment);
router.delete("/comments/:commentId", deleteComment);

module.exports = router;
