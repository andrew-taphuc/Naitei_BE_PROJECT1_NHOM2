const express = require('express');
const cors = require('cors');
const { connectDB, setupConnectionListeners } = require('./src/config/database');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Kết nối MongoDB và thiết lập event listeners
connectDB();
setupConnectionListeners();

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