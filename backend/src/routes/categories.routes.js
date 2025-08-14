const express = require('express');
const { list, create } = require('../controllers/Category.controller');
const { authMiddleware, requireAdmin } = require('../utils/jwt');
const router = express.Router();

router.get('/', list);
router.post('/', authMiddleware, requireAdmin, create);

module.exports = router;



