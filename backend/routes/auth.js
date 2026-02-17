import express from "express";
import jwt from "jsonwebtoken";

const router = express.Router();

// Mock users for demo - replace with database query
const MOCK_USERS = [
  { id: 1, user_id: "admin", password: "admin123", name: "Administrator", role: "admin", role_id: 1, unit_name: "Management" },
  { id: 2, user_id: "S02S02", password: "123456", name: "User Demo", role: "user", role_id: 2, unit_name: "Unit HR" },
  { id: 3, user_id: "user001", password: "password", name: "Staff IT", role: "user", role_id: 2, unit_name: "Unit IT" },
];

router.post("/login", (req, res) => {
  const { user_id, password } = req.body;

  // Find user
  const foundUser = MOCK_USERS.find(u => u.user_id === user_id);
  
  if (!foundUser) {
    return res.status(401).json({ success: false, message: "User tidak ditemukan" });
  }

  if (foundUser.password !== password) {
    return res.status(401).json({ success: false, message: "Password salah" });
  }

  // Create user payload (exclude password)
  const userPayload = {
    id: foundUser.id,
    user_id: foundUser.user_id,
    name: foundUser.name,
    role: foundUser.role,
    role_id: foundUser.role_id,
    unit_name: foundUser.unit_name,
  };

  const token = jwt.sign(
    userPayload,
    process.env.JWT_SECRET || "rahasia",
    { expiresIn: "8h" }
  );

  res.cookie("accessToken", token, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 8 * 60 * 60 * 1000 // 8 hours
  });

  res.json({
    success: true,
    user: userPayload,
  });
});

export default router;
