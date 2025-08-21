const express = require('express');
const { register, login, me, googleLogin, facebookLogin } = require('../controllers/Auth.controller');
const { authMiddleware } = require('../utils/jwt');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleLogin);
router.post('/facebook', facebookLogin);
router.get('/me', authMiddleware, me);

module.exports = router;


