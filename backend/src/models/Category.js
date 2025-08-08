const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        maxlength: 255
    },
    type: {
        type: String,
        enum: ['product', 'blog'],
        default: 'product'
    }
}, {
    timestamps: { createdAt: 'created_at', updatedAt: false }
});

module.exports = mongoose.model('Category', categorySchema);
