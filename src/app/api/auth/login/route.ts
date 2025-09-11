import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mysql from "mysql2/promise";

const SECRET_KEY = process.env.JWT_SECRET || "supersecret"; // ganti pakai env

export async function POST(req: Request) {
  const { email, password } = await req.json();

  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
  });

  const [rows]: any = await conn.execute(
    `SELECT u.*, r.role_name, un.unit_name 
     FROM users u
     JOIN roles r ON u.role_id = r.id
     LEFT JOIN units un ON u.unit_id = un.id
     WHERE u.email = ? AND u.status = 'active'`,
    [email]
  );

  if (rows.length === 0) {
    return NextResponse.json({ error: "User not found" }, { status: 401 });
  }

  const user = rows[0];
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  // buat JWT
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role_name, unit: user.unit_name },
    SECRET_KEY,
    { expiresIn: "8h" }
  );

  return NextResponse.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role_name,
      unit: user.unit_name,
    },
  });
}
