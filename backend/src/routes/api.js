const express = require("express");


const orderRoutes = require('./Order.routes');
const authRoutes = require('./auth.routes');
const productRoutes = require('./products.routes');
const reviewRoutes = require('./reviews.routes');
const categoryRoutes = require('./categories.routes');
const wishlistRoutes = require('./wishlist.routes');
const userRoutes = require('./users.routes');
const { bestSellers, promotions, newArrival } = require('../controllers/Product.controller');

const blogRoutes = require("./Blog.routes");
const commentRoutes = require("./Comment.routes");
const tagRoutes = require("./Tag.routes");


const router = express.Router();

router.use("/orders", orderRoutes);
router.use("/auth", authRoutes);
router.use("/products", productRoutes);
router.use("/reviews", reviewRoutes);
router.use("/wishlist", wishlistRoutes);
router.use("/users", userRoutes);
router.use("/blogs", blogRoutes);

router.use('/categories', categoryRoutes);

// Frontend compatibility shortcuts
router.get('/bestSellers', bestSellers);
router.get('/promotions', promotions);
router.get('/newArrival', newArrival);

router.use("/comments", commentRoutes);
router.use("/tags", tagRoutes);

module.exports = router;
