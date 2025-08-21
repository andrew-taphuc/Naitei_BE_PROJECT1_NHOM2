const express = require('express');
const { list, create, list_blog } = require('../controllers/Category.controller');
const { authMiddleware, requireAdmin } = require('../utils/jwt');
const router = express.Router();

router.get('/', list);
router.get('/blogs', list_blog);
router.post('/', create);

module.exports = router;



