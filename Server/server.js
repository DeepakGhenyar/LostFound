const path = require("path");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const morgan = require("morgan");
const dotenv = require("dotenv");

// Load .env
dotenv.config({ path: path.join(__dirname, ".env") });

// Validate required env vars
const REQUIRED_ENV = ["MONGO_URI", "JWT_SECRET"];
const missing = REQUIRED_ENV.filter((key) => !process.env[key]);
if (missing.length > 0) {
  console.error(`❌ Missing required environment variables: ${missing.join(", ")}`);
  process.exit(1);
}

const app = express();

// ─── Middleware ────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// ─── Routes ───────────────────────────────────────────────────
app.use("/api", require("./routes/authRoutes"));
app.use("/api/items", require("./routes/itemRoutes"));

// ─── Protected Dashboard Route ────────────────────────────────
const protect = require("./middleware/authMiddleware");
app.get("/api/dashboard", protect, (req, res) => {
  res.json({
    success: true,
    message: `Welcome to dashboard, ${req.user.name}!`,
    user: { id: req.user._id, name: req.user.name, email: req.user.email },
  });
});

// ─── Health Check ─────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({ message: "Lost & Found API is running 🔍" });
});

// ─── Global Error Handler ─────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// ─── Database + Server Start ──────────────────────────────────
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected");
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });
