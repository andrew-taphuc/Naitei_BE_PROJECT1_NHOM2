const express = require("express");
const orderRoutes = require('./Order.routes');
const authRoutes = require('./auth.routes');
const productRoutes = require('./products.routes');
const reviewRoutes = require('./reviews.routes');
const wishlistRoutes = require('./wishlist.routes');
const userRoutes = require('./users.routes');
const router = express.Router();

router.use('/orders', orderRoutes);
router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/reviews', reviewRoutes);
router.use('/wishlist', wishlistRoutes);
router.use('/users', userRoutes);

module.exports = router;