module.exports = function (io) {
  io.on("connection", (socket) => {
    console.log("👤 A user connected:", socket.id);

    // 👉 Client yêu cầu tham gia room (theo postId hoặc roomId)
    socket.on("joinRoom", (roomId) => {
      socket.join(roomId);
      console.log(`📥 User ${socket.id} joined room: ${roomId}`);
    });

    // 👉 Nhận comment từ client và phát cho các client khác trong cùng room
    socket.on("sendComment", ({ roomId, comment }) => {
      console.log(`💬 [${roomId}] Comment:`, comment);

      // Gửi comment đến tất cả client trong room (kể cả người gửi)
      io.to(roomId).emit("getComment", {
        comment,
        senderId: socket.id,
        roomId,
        timestamp: new Date().toISOString(),
      });
    });

    socket.on("disconnect", () => {
      console.log("👋 User disconnected:", socket.id);
    });
  });
};
