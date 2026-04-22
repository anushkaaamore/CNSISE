const express = require("express");
const http = require("http");
const cors = require("cors");
const socketIo = require("socket.io");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const { db } = require("./firebaseAdmin"); // Firestore database

const app = express();
const server = http.createServer(app);

const io = socketIo(server, {
  cors: { origin: ["http://localhost:3000", "http://localhost:3001"], methods: ["GET", "POST"] },
});

// ─── Security Headers ────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: ["http://localhost:3000", "http://localhost:3001"] }));
app.use(express.json());

// ─── JWT secret key ──────────────────────────────────────────────────────────
const JWT_SECRET = "cns_ise_secret_key_2024_do_not_share";

// ─── Firestore collection references ─────────────────────────────────────────
const usersCol = db.collection("users");       // stores registered users
const messagesCol = db.collection("messages"); // stores encrypted messages

// ─── Track online users in memory (socket.id -> username) ────────────────────
const onlineUsers = new Map();

// ─── Rate Limiter: max 20 requests per minute per IP ─────────────────────────
const msgLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: { error: "Too many messages. Slow down!" },
  standardHeaders: true,
  legacyHeaders: false,
});

// ─── JWT Middleware ───────────────────────────────────────────────────────────
const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No token provided" });
    }
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token expired, please login again" });
    }
    return res.status(401).json({ error: "Invalid token" });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// AUTH ROUTES
// ─────────────────────────────────────────────────────────────────────────────

// POST /register — create a new user, store in Firestore
app.post("/register", async (req, res) => {
  try {
    const { email, username, passwordHash } = req.body;

    if (!email || !username || !passwordHash) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Check if user already exists in Firestore
    const existingUser = await usersCol.doc(email).get();
    if (existingUser.exists) {
      return res.status(409).json({ error: "Email already registered" });
    }

    // bcrypt the SHA-256 hash (double protection)
    const bcryptHash = await bcrypt.hash(passwordHash, 10);

    // Save user to Firestore — persists forever even after server restart
    await usersCol.doc(email).set({
      email,
      username,
      bcryptHash,
      createdAt: new Date().toISOString(),
    });

    // Generate JWT token
    const token = jwt.sign({ email, username }, JWT_SECRET, { expiresIn: "2h" });

    console.log(`✅ New user registered in Firestore: ${username} (${email})`);
    res.status(201).json({ token, username });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Server error during registration" });
  }
});

// POST /login — verify user against Firestore
app.post("/login", async (req, res) => {
  try {
    const { email, passwordHash } = req.body;

    if (!email || !passwordHash) {
      return res.status(400).json({ error: "Email and password required" });
    }

    // Fetch user from Firestore
    const userDoc = await usersCol.doc(email).get();
    if (!userDoc.exists) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const user = userDoc.data();

    // Verify bcrypt hash
    const isMatch = await bcrypt.compare(passwordHash, user.bcryptHash);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Generate fresh JWT
    const token = jwt.sign(
      { email, username: user.username },
      JWT_SECRET,
      { expiresIn: "2h" }
    );

    console.log(`✅ User logged in from Firestore: ${user.username}`);
    res.json({ token, username: user.username });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error during login" });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// MESSAGE ROUTES
// ─────────────────────────────────────────────────────────────────────────────

// POST /send — store encrypted message in Firestore
app.post("/send", verifyToken, msgLimiter, async (req, res) => {
  try {
    const { ciphertext, iv, hmac, timestamp } = req.body;

    if (!ciphertext || !iv) {
      return res.status(400).json({ error: "Encrypted message is required" });
    }

    const message = {
      ciphertext,   // AES-256-GCM encrypted content
      iv,           // Initialization vector
      hmac,         // HMAC-SHA256 integrity signature
      author: req.user.username,  // from verified JWT
      timestamp: timestamp || Date.now(),
    };

    // Save to Firestore — message persists after server restart!
    const docRef = await messagesCol.add(message);
    message.id = docRef.id; // Firestore auto-generated ID

    // Broadcast to all connected clients
    io.emit("message", message);

    console.log(`💬 Message stored in Firestore by ${message.author}`);
    res.json({ success: true, id: docRef.id });
  } catch (err) {
    console.error("Send error:", err);
    res.status(500).json({ error: "Failed to send message" });
  }
});

// GET /messages — fetch last 100 messages from Firestore
app.get("/messages", verifyToken, async (req, res) => {
  try {
    // Order by timestamp, get last 100 messages
    const snapshot = await messagesCol
      .orderBy("timestamp", "asc")
      .limitToLast(100)
      .get();

    const messages = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json(messages);
  } catch (err) {
    console.error("Fetch messages error:", err);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

// DELETE /messages/:id — delete specific message from Firestore
app.delete("/messages/:id", verifyToken, async (req, res) => {
  try {
    const docRef = messagesCol.doc(req.params.id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Message not found" });
    }

    // Only the author can delete their own message
    if (doc.data().author !== req.user.username) {
      return res.status(403).json({ error: "You can only delete your own messages" });
    }

    await docRef.delete();

    // Notify all clients of deletion
    io.emit("messageDeleted", { id: req.params.id });

    console.log(`🗑️ Message deleted from Firestore by ${req.user.username}`);
    res.json({ success: true });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ error: "Failed to delete message" });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// SOCKET.IO — Real-time events
// ─────────────────────────────────────────────────────────────────────────────

io.on("connection", (socket) => {
  console.log(`🔌 Socket connected: ${socket.id}`);

  socket.on("userJoin", (username) => {
    onlineUsers.set(socket.id, username);
    io.emit("onlineUsers", Array.from(onlineUsers.values()));
    console.log(`👤 ${username} joined. Online: ${onlineUsers.size}`);
  });

  socket.on("typing", (username) => {
    socket.broadcast.emit("userTyping", username);
  });

  socket.on("stopTyping", (username) => {
    socket.broadcast.emit("userStopTyping", username);
  });

  socket.on("disconnect", () => {
    const username = onlineUsers.get(socket.id);
    onlineUsers.delete(socket.id);
    io.emit("onlineUsers", Array.from(onlineUsers.values()));
    console.log(`❌ ${username || "Unknown"} disconnected. Online: ${onlineUsers.size}`);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
server.listen(5000, () => {
  console.log("🚀 SecureChat server running on http://localhost:5000");
  console.log("🔥 Connected to Firebase Firestore");
  console.log("🔒 Security: JWT + bcrypt + Helmet + Rate limiting active");
});