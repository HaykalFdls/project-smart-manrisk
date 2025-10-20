import jwt from "jsonwebtoken";

const JWT_SECRET = "access_secret_key"; // sama dengan di server.js

export const authenticateToken = (req, res, next) => {
  const token = req.cookies.accessToken; // ambil dari cookie
  console.log("Cookies diterima:", req.cookies);

  if (!token) {
    console.log("Tidak ada token di cookie.");
    return res.status(401).json({ message: "Akses ditolak, token tidak ada" });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.log("Token tidak valid atau kadaluarsa:", err.message);
      return res.status(403).json({ message: "Token tidak valid atau kadaluarsa" });
    }

    console.log("🧩 Decoded JWT:", user); //DEBUG: lihat isi token yang ter-decode

    req.user = user;
    next();
  });
};
