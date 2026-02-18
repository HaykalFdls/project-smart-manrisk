import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import pool from "../config/db.js";

const router = express.Router();

function toPermissionBool(value) {
  if (value === true || value === 1) return true;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    return normalized === "1" || normalized === "true";
  }
  // Handle BIT(1) from mysql2 (Buffer)
  if (Buffer.isBuffer(value)) {
    return value.length > 0 && value[0] === 1;
  }
  return false;
}

router.post("/login", async (req, res) => {
  try {
    const { user_id, password } = req.body;

    if (!user_id || !password) {
      return res.status(400).json({
        success: false,
        message: "User ID dan Password wajib diisi",
      });
    }

    // Ambil user dengan role dan unit info
    const [rows] = await pool.execute(
      `SELECT u.id, u.user_id, u.name, u.email, u.password, u.role_id, u.unit_id, u.status,
              r.role_name, 
              un.unit_name
       FROM users u
       LEFT JOIN roles r ON u.role_id = r.id
       LEFT JOIN units un ON u.unit_id = un.id
       WHERE u.user_id = ? LIMIT 1`,
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

    // Ambil permissions berdasarkan role_id
    const [permissions] = await pool.execute(
      `SELECT can_create, can_read, can_view, can_update, can_approve, can_delete, can_provision
       FROM role_permissions
       WHERE role_id = ?`,
      [user.role_id]
    );

    const userPermissions = permissions.length > 0 ? {
      can_create: toPermissionBool(permissions[0].can_create),
      can_read: toPermissionBool(permissions[0].can_read),
      can_view: toPermissionBool(permissions[0].can_view),
      can_update: toPermissionBool(permissions[0].can_update),
      can_approve: toPermissionBool(permissions[0].can_approve),
      can_delete: toPermissionBool(permissions[0].can_delete),
      can_provision: toPermissionBool(permissions[0].can_provision),
    } : {};

    const userPayload = {
      id: user.id,
      user_id: user.user_id,
      name: user.name,
      email: user.email,
      role_id: user.role_id,
      role_name: user.role_name,
      unit_id: user.unit_id,
      unit_name: user.unit_name,
      status: user.status,
      permissions: userPermissions,
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
