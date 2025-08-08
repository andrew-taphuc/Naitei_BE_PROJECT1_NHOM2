const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    _id: {
        type: String,
        required: true
    },
    product_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    user_name: {
        type: String,
        required: true,
        maxlength: 255
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String
    }
}, {
    timestamps: { createdAt: 'created_at', updatedAt: false },
    _id: false
});

module.exports = mongoose.model('Review', reviewSchema);
