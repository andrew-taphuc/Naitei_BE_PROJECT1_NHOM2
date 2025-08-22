const express = require('express');
const { list, create, update, remove, swapOrder } = require('../controllers/Banner.controller');
const router = express.Router();

router.get('/', list);
router.post('/', create);
router.put('/:id', update);
router.delete('/:id', remove);
router.post('/swap-order', swapOrder);

module.exports = router;