const express = require('express');
const { list, add, remove } = require('../controllers/Wishlist.controller');
const { authMiddleware } = require('../utils/jwt');
const router = express.Router();

router.get('/', authMiddleware, list);
router.post('/', authMiddleware, add);
router.delete('/:productId', authMiddleware, remove);

module.exports = router;


