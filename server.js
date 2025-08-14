const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const mysql = require("mysql2");
const session = require("express-session");
const cors = require("cors");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");
const sessionMiddleware = require("./config/session");

require("dotenv").config();

const authRoutes = require("./routes/auth.routes");

const app = express();

const bdd = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'fws'
});

bdd.connect(err => {
  if (err) {
    console.log("Error connecting to Db");
    console.log(err)
    return;
  }
  console.log("Connection established");
});

// Middleware
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(sessionMiddleware);
app.use("/api", authRoutes);

// Connexion Socket.IO
const userSockets = new Map();

io.use((socket, next) => {
  sessionMiddleware(socket.request, {}, next);
});

io.on("connection", (socket) => {
  const session = socket.request.session;
  if (!session?.user?.id) {
    return socket.disconnect();
  }

  const userId = session.user.id;
  userSockets.set(userId, socket);

  console.log(`🔌 User ${userId} connecté via socket`);

  socket.on("sendMessage", ({ to, message }) => {
    const targetSocket = userSockets.get(to);
    if (targetSocket) {
      targetSocket.emit("receiveMessage", {
        from: userId,
        message,
        sent_at: new Date().toISOString()
      });
    }
  });

  socket.on("disconnect", () => {
    userSockets.delete(userId);
    console.log(`❌ User ${userId} déconnecté`);
  });
});

server.listen(3000, () => {
  console.log("✅ Serveur en ligne sur http://localhost:3000");
});
