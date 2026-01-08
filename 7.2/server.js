const path = require("path");
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve frontend
app.use(express.static(path.join(__dirname, "public")));

// Simple health route
app.get("/health", (req, res) => res.json({ ok: true }));

// In-memory state (fine for demo)
const users = new Map(); // socketId -> { name, room }
const roomUsers = (room) =>
  [...users.entries()]
    .filter(([, u]) => u.room === room)
    .map(([id, u]) => ({ id, name: u.name }));

const sendRoomState = (room) => {
  io.to(room).emit("roomState", {
    room,
    onlineCount: roomUsers(room).length,
    users: roomUsers(room)
  });
};

io.on("connection", (socket) => {
  // Join a room (custom event)
  socket.on("joinRoom", ({ name, room }) => {
    const safeName = (name || "Guest").toString().trim().slice(0, 20) || "Guest";
    const safeRoom = (room || "General").toString().trim().slice(0, 20) || "General";

    users.set(socket.id, { name: safeName, room: safeRoom });
    socket.join(safeRoom);

    // Notify room
    socket.to(safeRoom).emit("systemNotice", {
      type: "join",
      message: `${safeName} joined ${safeRoom}`,
      ts: Date.now()
    });

    // Welcome only to this user
    socket.emit("systemNotice", {
      type: "welcome",
      message: `Welcome, ${safeName}! You are in room: ${safeRoom}`,
      ts: Date.now()
    });

    sendRoomState(safeRoom);
  });

  // Chat message (custom event)
  socket.on("sendChat", ({ text }) => {
    const user = users.get(socket.id);
    if (!user) return;

    const msg = (text || "").toString().trim();
    if (!msg) return;

    const payload = {
      from: user.name,
      text: msg.slice(0, 400),
      ts: Date.now()
    };

    io.to(user.room).emit("chatBroadcast", payload);
  });

  // Typing indicator (custom event)
  socket.on("typing", ({ isTyping }) => {
    const user = users.get(socket.id);
    if (!user) return;

    socket.to(user.room).emit("typingIndicator", {
      user: user.name,
      isTyping: Boolean(isTyping)
    });
  });

  // Reaction (custom event)
  socket.on("sendReaction", ({ emoji }) => {
    const user = users.get(socket.id);
    if (!user) return;

    const allowed = ["👍", "👏", "🔥", "✅", "😂", "🎉"];
    const chosen = allowed.includes(emoji) ? emoji : "👍";

    io.to(user.room).emit("reactionBroadcast", {
      from: user.name,
      emoji: chosen,
      ts: Date.now()
    });
  });

  // Disconnect
  socket.on("disconnect", () => {
    const user = users.get(socket.id);
    if (!user) return;

    users.delete(socket.id);

    socket.to(user.room).emit("systemNotice", {
      type: "leave",
      message: `${user.name} left ${user.room}`,
      ts: Date.now()
    });

    sendRoomState(user.room);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`✅ Server running: http://localhost:${PORT}`));
