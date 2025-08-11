const express = require('express');
const { list, getOne, update, me, updateMe } = require('../controllers/User.controller');
const { authMiddleware } = require('../utils/jwt');
const router = express.Router();

router.get('/', list);
router.get('/:id', getOne);
router.put('/:id', update);

// profile
router.get('/_me/profile', authMiddleware, me);
router.put('/_me/profile', authMiddleware, updateMe);

module.exports = router;


