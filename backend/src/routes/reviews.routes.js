const express = require('express');
const { listByProduct, create } = require('../controllers/Review.controller');
const router = express.Router();

router.get('/', listByProduct);
router.post('/', create);

module.exports = router;


