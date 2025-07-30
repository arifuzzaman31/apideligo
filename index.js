const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const { Pool } = require("pg");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const pool = new Pool({
  connectionString: "postgresql://postgres:7575@localhost:5432/deligo",
});

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("locationUpdate", async (data) => {
    const { userId, lat, lng, type } = data; // type: rider or passenger

    // Store or update in DB
    await pool.query(
      `INSERT INTO locations (user_id, lat, lng, type)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id) DO UPDATE
       SET lat = $2, lng = $3, updated_at = NOW()`,
      [userId, lat, lng, type]
    );

    // Broadcast to opposite type (e.g. passengers get nearby drivers)
    socket.broadcast.emit(`${type}Location`, { userId, lat, lng });
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

server.listen(3000, () => {
  console.log("Server running on port 3000");
});
