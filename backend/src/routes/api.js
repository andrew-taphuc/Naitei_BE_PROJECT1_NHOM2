const express = require("express");
const orderRoutes = require('./Order.routes');
const router = express.Router();

router.use('/orders', orderRoutes);

module.exports = router;