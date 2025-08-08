const express = require('express');
const router = express.Router();
const {
    createOrder,
    updateOrder,
    deleteOrder,
    updateOrderStatus,
    getOrderById,
    getAllOrders
} = require('../controllers/Order.controller');

// Routes cho Order

// Tạo đơn hàng mới
router.post('/newOrder', createOrder);

// Lấy đơn hàng theo ID
router.get('/:orderId', getOrderById);

// Cập nhật đơn hàng (chỉ pending)
router.put('/:orderId', updateOrder);

// Xóa đơn hàng (chỉ pending)
router.delete('/:orderId', deleteOrder);

// Cập nhật status đơn hàng (cho admin)
router.put('/:orderId/status', updateOrderStatus);

router.get('/', getAllOrders);

module.exports = router;