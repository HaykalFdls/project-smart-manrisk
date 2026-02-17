import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import pool from "../config/db.js";

const router = express.Router();

router.post("/login", async (req, res) => {
  try {
    const { user_id, password } = req.body;

    if (!user_id || !password) {
      return res.status(400).json({
        success: false,
        message: "User ID dan Password wajib diisi",
      });
    }

    // Ambil user dari database
    const [rows] = await pool.execute(
      "SELECT * FROM users WHERE user_id = ? LIMIT 1",
      [user_id]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "User tidak ditemukan",
      });
    }

    const user = rows[0];

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Password salah",
      });
    }

    const userPayload = {
      id: user.id,
      user_id: user.user_id,
      name: user.name,
      role: user.role,
      role_id: user.role_id,
      unit_name: user.unit_name,
    };

    const token = jwt.sign(
      userPayload,
      process.env.JWT_SECRET || "secret123",
      { expiresIn: "8h" }
    );

    res.cookie("accessToken", token, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 8 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      user: userPayload,
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
    });
  }
});

export default router;
