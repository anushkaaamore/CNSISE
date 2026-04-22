const express = require("express");
const http = require("http");
const cors = require("cors");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);

const io = socketIo(server, {
  cors: { origin: "*" },
});

app.use(cors());
app.use(express.json());

// 🔐 Simple Auth middleware (for demo - uses mock tokens)
const auth = (req, res, next) => {
  try {
    const token = req.headers.authorization;
    if (!token) return res.status(401).send("No token");

    // Demo mode: Accept any token starting with "mock_token_"
    if (token.startsWith("mock_token_")) {
      req.user = { token: token };
      next();
    } else {
      res.status(401).send("Invalid token");
    }
  } catch (err) {
    console.error(err);
    res.status(401).send("Unauthorized");
  }
};

// 💬 in-memory messages
const messages = [];

// 📩 send message
app.post("/send", auth, (req, res) => {
  const message = req.body;

  messages.push(message);
  io.emit("message", message);

  res.send("ok");
});

// 📥 get messages
app.get("/messages", auth, (req, res) => {
  res.json(messages);
});

// 🔌 socket
io.on("connection", (socket) => {
  console.log("User connected");
});

server.listen(5000, () => {
  console.log("Server running on 5000");
});