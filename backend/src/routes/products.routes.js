const express = require('express');
const { list, getOne, bestSellers, promotions, newArrival, categories, create } = require('../controllers/Product.controller');
const { authMiddleware, requireAdmin } = require('../utils/jwt');
const router = express.Router();

router.post('/', authMiddleware, requireAdmin, create);
router.get('/', list);
router.get('/_bestSellers/list', bestSellers);
router.get('/_promotions/list', promotions);
router.get('/_newArrival/list', newArrival);
router.get('/_categories/list', categories);
router.get('/:id', getOne);

module.exports = router;


