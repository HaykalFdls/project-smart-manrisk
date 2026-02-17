import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth.js";
import authenticateToken from "./middleware/auth.js";

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: "http://localhost:9002",
    credentials: true,
  })
);

// ================= ROUTES =================
app.use("/api/auth", authRoutes);

// 🔥 TEST API
app.get("/api/ping", (req, res) => {
  res.json({ message: "pong" });
});

// 🔐 AUTH CHECK
app.get("/api/me", authenticateToken, (req, res) => {
  res.json({
    success: true,
    user: req.user,
  });
});

// ================= START =================
const PORT = 5001;
app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
});
