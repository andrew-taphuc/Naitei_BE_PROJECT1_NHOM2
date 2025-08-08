const { Order, User } = require('../models');
const { v4: uuidv4 } = require('uuid'); 

// Tạo 1 đơn hàng mới từ user
const createOrder = async (req, res) => {
  try {
    const { 
      userId, 
      items, 
      payment_method,
      shipping_address,
      phone,
      email 
    } = req.body;

    // Kiểm tra xem người dùng có tồn tại không
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Validate items array
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Items are required and must be a non-empty array' });
    }

    // Validate và tính toán total từ items
    let subtotal = 0;
    const processedItems = [];

    for (const item of items) {
      // Validate required fields trong mỗi item
      if (!item.product_id || !item.quantity || item.quantity <= 0) {
        return res.status(400).json({ 
          message: 'Each item must have valid product_id and quantity > 0' 
        });
      }

      // Validate price
      if (!item.price || item.price <= 0) {
        return res.status(400).json({ 
          message: 'Each item must have valid price > 0' 
        });
      }

      // Kiểm tra product có tồn tại không
      const product = await Product.findById(item.product_id);
      if (!product) {
        return res.status(404).json({ 
          message: `Product with ID ${item.product_id} not found` 
        });
      }

      // Tính giá sau discount cho item này
      const itemDiscount = item.discount || 0;
      const discountedPrice = item.price * (1 - itemDiscount / 100);

      // Tính subtotal cho item này
      const itemSubtotal = discountedPrice * item.quantity;
      subtotal += itemSubtotal;

      // Thêm vào processed items với thông tin đầy đủ
      processedItems.push({
        product_id: item.product_id,
        product_name: item.product_name || 'Unknown Product',
        price: item.price, // Giá gốc
        quantity: item.quantity,
        discount: itemDiscount,
        image_url: item.image_url || ''
      });
    }

    // Hardcode tính VAT 10%
    const VAT_RATE = 0.10; // 10%
    const vatAmount = subtotal * VAT_RATE;
    const totalWithVAT = subtotal + vatAmount;

    // Tạo đơn hàng mới với total đã bao gồm VAT
    const order = await Order.create({
      _id: uuidv4(),
      user_id: userId,
      items: items,
      total: Math.round(totalWithVAT * 100) / 100, // Total đã bao gồm VAT
      status: 'pending',
      payment_method: payment_method || '',
      shipping_address: shipping_address || '',
      phone: phone || '',
      email: email || ''
    });

    return res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: {
        ...order.toObject(),
        item_count: processedItems.length
      }
    });
    
  } catch (error) {
    console.error('Error creating order:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: error.errors 
      });
    }
    
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        message: 'Invalid ID format' 
      });
    }
    
    return res.status(500).json({ message: 'Internal server error' });
  }
};


// Xoá, sửa những đơn hàng trong trạng thái pending
const updateOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const updateData = req.body;

        // Tìm đơn hàng theo ID
        const existingOrder = await Order.findById(orderId);
        
        if (!existingOrder) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Chỉ cho phép cập nhật đơn hàng có status là 'pending'
        if (existingOrder.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: 'Chỉ có thể cập nhật đơn hàng đang ở trạng thái pending'
            });
        }

        // Cập nhật đơn hàng
        const updatedOrder = await Order.findByIdAndUpdate(
            orderId,
            updateData,
            { 
                new: true, // Trả về document đã được cập nhật
                runValidators: true // Chạy validation
            }
        ).populate('user_id', 'full_name email phone');

        return res.status(200).json({
            success: true,
            message: 'Order updated successfully',
            data: updatedOrder
        });

    } catch (error) {
        console.error('Error updating order:', error);
        
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: error.errors
            });
        }
        
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Xóa đơn hàng (chỉ pending)
const deleteOrder = async (req, res) => {
    try {
        const { orderId } = req.params;

        // Tìm đơn hàng
        const order = await Order.findById(orderId);
        
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Chỉ cho phép xóa đơn hàng có status là 'pending'
        if (order.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: 'Chỉ có thể xóa đơn hàng đang ở trạng thái pending'
            });
        }

        // Xóa đơn hàng
        await Order.findByIdAndDelete(orderId);

        return res.status(200).json({
            success: true,
            message: 'Order deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting order:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Cập nhật status đơn hàng (cho admin)
const updateOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;

        // Validate status
        const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status'
            });
        }

        const updatedOrder = await Order.findByIdAndUpdate(
            orderId,
            { status },
            { new: true, runValidators: true }
        ).populate('user_id', 'full_name email phone');

        if (!updatedOrder) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Order status updated successfully',
            data: updatedOrder
        });

    } catch (error) {
        console.error('Error updating order status:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Lấy danh sách các đơn hàng từ 1 id ng dùng
const getOrderById = async (req, res) => {
    try {
        const { userId } = req.params;

        // Tìm tất cả đơn hàng của người dùng
        const orders = await Order.find({ user_id: userId })
            .populate('user_id', 'full_name email phone')
            .sort({ createdAt: -1 }); // Sắp xếp theo ngày tạo mới nhất

        if (orders.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No orders found for this user'
            });
        }

        return res.status(200).json({
            success: true,
            data: orders
        });

    } catch (error) {
        console.error('Error fetching orders:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Lấy danh sách tất cả các đơn hàng trong db
const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('user_id', 'full_name email phone')
            .sort({ createdAt: -1 }); // Sắp xếp theo ngày tạo mới 
        if (orders.length === 0) {
            return res.status(404).json({
                success: false, 
                message: 'No orders found'
            });
        }
        return res.status(200).json({
            success: true,
            data: orders
        });
    } catch (error) {
        console.error('Error fetching all orders:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};



// Export functions
module.exports = {
    createOrder,
    updateOrder,
    deleteOrder,
    updateOrderStatus,
    getOrderById,
    getAllOrders
};