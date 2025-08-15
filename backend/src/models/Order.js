const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    _id: {
        type: String,
        required: true
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [{
        // Align with frontend OrderItem shape
        product_id: { type: String, required: true },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true },
        discount: { type: Number, default: 0 },
        image: { type: String, default: '' }
    }],
    total: {
        type: Number,
        required: true,
        min: 0
    },
    status: {
        type: String,
        enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
        default: 'pending'
    },
    payment_method: {
        type: String,
        maxlength: 100
    },
    shipping_address: {
        type: String
    },
    phone: {
        type: String,
        maxlength: 20
    },
    email: {
        type: String,
        maxlength: 255
    }
}, {
    timestamps: true,
    _id: false
});

module.exports = mongoose.model('Order', orderSchema);
