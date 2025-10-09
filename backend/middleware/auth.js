import jwt from "jsonwebtoken";

const JWT_SECRET = "access_secret_key"; // atau ambil dari process.env.JWT_SECRET

export function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Token tidak ditemukan" });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.error("❌ Token invalid:", err);
      return res.status(403).json({ message: "Token tidak valid" });
    }

    req.user = user; // simpan payload user ke req.user
    next();
  });
}
