const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    product_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    }
}, {
    timestamps: { createdAt: 'created_at', updatedAt: false }
});

// Tạo unique index cho user_id và product_id
wishlistSchema.index({ user_id: 1, product_id: 1 }, { unique: true });

module.exports = mongoose.model('Wishlist', wishlistSchema);
