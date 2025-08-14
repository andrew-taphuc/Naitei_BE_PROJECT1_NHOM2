const express = require("express");
const orderRoutes = require("./Order.routes");
const blogRoutes = require("./Blog.routes");
const commentRoutes = require("./Comment.routes");
const categoryRoutes = require("./Category.routes");
const tagRoutes = require("./Tag.routes");
const userRoutes = require("./User.routes");

const router = express.Router();

// Mount all routes
router.use("/orders", orderRoutes);
router.use("/blogs", blogRoutes);
router.use("/comments", commentRoutes);
router.use("/categories", categoryRoutes);
router.use("/tags", tagRoutes);
router.use("/users", userRoutes);

module.exports = router;
