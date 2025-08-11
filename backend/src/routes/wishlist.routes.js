const express = require('express');
const { add } = require('../controllers/Wishlist.controller');
const router = express.Router();

router.post('/', add);

module.exports = router;


