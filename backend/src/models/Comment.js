const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    blog_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Blog',
        required: true
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    content: {
        type: String,
        required: true
    },
    reply_to: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment',
        default: null
    }
}, {
    timestamps: { createdAt: 'created_at', updatedAt: false }
});

module.exports = mongoose.model('Comment', commentSchema);
