const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        maxlength: 500
    },
    description: {
        type: String
    },
    contents: {
        type: String
    },
    category_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    },
    images: [{
        type: String
    }],
    tags: {
        type: String,
        maxlength: 500
    },
    author_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Blog', blogSchema);
