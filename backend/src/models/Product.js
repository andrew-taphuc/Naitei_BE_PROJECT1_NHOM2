const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        maxlength: 255
    },
    category_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    old_price: {
        type: Number,
        required: true,
        min: 0
    },
    discount: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    description: {
        type: String
    },
    images: [{
        url: String,
        is_primary: {
            type: Boolean,
            default: false
        }
    }],
    variants: [{
        name: String,
        price: Number,
        in_stock: Number,
        color: String,
        type: String
    }],
    specifications: {
        type: Map,
        of: String
    },
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    review_count: {
        type: Number,
        default: 0,
        min: 0
    },
    in_stock: {
        type: Boolean,
        default: true
    },
    care_instructions: {
        type: String
    },
    new_arrival: {
        type: Boolean,
        default: false
    },
    tags: {
        type: String,
        maxlength: 500
    }
}, {
    timestamps: true
});

// Virtual để tính giá sau giảm giá
productSchema.virtual('current_price').get(function() {
    return this.old_price * (1 - this.discount / 100);
});

module.exports = mongoose.model('Product', productSchema);
