const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Kết nối MongoDB
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Kết nối MongoDB thành công');
    } catch (error) {
        console.error('Lỗi kết nối MongoDB:', error.message);
        process.exit(1);
    }
};

connectDB();

// Event listeners cho MongoDB connection
mongoose.connection.on('connected', () => {
    console.log('Mongoose đã kết nối tới MongoDB');
});
mongoose.connection.on('error', (err) => {
    console.error('Lỗi kết nối Mongoose:', err);
});
mongoose.connection.on('disconnected', () => {
    console.log('Mongoose đã ngắt kết nối');
});

// Start server
const server = app.listen(PORT, (err) => {
    if (err) {
        console.error('Lỗi khi khởi động server:', err);
        process.exit(1);
    }
    console.log(`Server đang chạy trên port ${PORT}`);
    console.log(`Truy cập: http://localhost:${PORT}`);
});

server.on('error', (error) => {
    console.error('Server gặp lỗi:', error);
    process.exit(1);
});