const express = require('express');
const { list, getOne, bestSellers, promotions, newArrival, categories } = require('../controllers/Product.controller');
const router = express.Router();

router.get('/', list);
router.get('/_bestSellers/list', bestSellers);
router.get('/_promotions/list', promotions);
router.get('/_newArrival/list', newArrival);
router.get('/_categories/list', categories);
router.get('/:id', getOne);

module.exports = router;


