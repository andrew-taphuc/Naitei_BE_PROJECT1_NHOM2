const express = require("express");
const orderRoutes = require("./Order.routes");
const blogRoutes = require("./Blog.routes");
const router = express.Router();

router.use("/orders", orderRoutes);
router.use("/blogs", blogRoutes);

module.exports = router;
