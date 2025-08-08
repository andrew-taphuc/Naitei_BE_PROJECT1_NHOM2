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
        product_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product'
        },
        product_name: String,
        price: Number,
        quantity: Number,
        discount: Number,
        image_url: String
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
