const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Kết nối MongoDB thành công');
    } catch (error) {
        console.error('Lỗi kết nối MongoDB:', error.message);
        process.exit(1);
    }
};

// Event listeners cho MongoDB connection
const setupConnectionListeners = () => {
    mongoose.connection.on('connected', () => {
        console.log('Mongoose đã kết nối tới MongoDB');
    });
    
    mongoose.connection.on('error', (err) => {
        console.error('Lỗi kết nối Mongoose:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
        console.log('Mongoose đã ngắt kết nối');
    });
};

module.exports = {
    connectDB,
    setupConnectionListeners
};
