const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    full_name: {
        type: String,
        required: true,
        maxlength: 255
    },
    email: {
        type: String,
        required: true,
        unique: true,
        maxlength: 255
    },
    phone: {
        type: String,
        maxlength: 20
    },
    address: {
        type: String
    },
    password: {
        type: String,
        required: true,
        maxlength: 255
    },
    image: {
        type: String,
        maxlength: 255
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('User', userSchema);
