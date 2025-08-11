const express = require('express');
const { register, login, me } = require('../controllers/Auth.controller');
const { authMiddleware } = require('../utils/jwt');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authMiddleware, me);

module.exports = router;


