import jwt from "jsonwebtoken";

const JWT_SECRET = "your_secret_key"; // lebih baik ditaro di .env

export function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ message: "Token tidak ada" });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Token tidak valid" });
    req.user = user; // { id, role_id }
    next();
  });
}
