const express = require("express");
const cors = require("cors");
const http = require("http"); // THÊM DÒNG NÀY để tạo server chuẩn
const { Server } = require("socket.io");
const {
  connectDB,
  setupConnectionListeners,
} = require("./src/config/database");
require("dotenv").config();
const apiRoutes = require("./src/routes/api");

const app = express();
const PORT = process.env.PORT || 3001;

// Tạo HTTP server từ Express
const server = http.createServer(app);

// Tạo socket.io instance sau khi có server
const io = new Server(server, {
  cors: {
    origin: "*", // Nếu có frontend cụ thể thì thay * bằng domain
    methods: ["GET", "POST"],
  },
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Kết nối MongoDB và thiết lập event listeners
connectDB();
setupConnectionListeners();

// API Routes
app.use(apiRoutes);

// Socket setup
require("./src/utils/socket")(io);

// Khởi động server
server.listen(PORT, (err) => {
  if (err) {
    console.error("❌ Lỗi khi khởi động server:", err);
    process.exit(1);
  }
  console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
});

server.on("error", (error) => {
  console.error("❌ Server gặp lỗi:", error);
  process.exit(1);
});
