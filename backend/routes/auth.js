import express from "express";
import jwt from "jsonwebtoken";

const router = express.Router();

router.post("/login", (req, res) => {
  const user = {
    id: 55,
    role_id: 5,
    unit_id: 1,
  };

  const token = jwt.sign(
    user,
    process.env.JWT_SECRET || "rahasia",
    { expiresIn: "1h" }
  );

  res.cookie("accessToken", token, {
    httpOnly: true,
    sameSite: "lax",
  });

  res.json({
    success: true,
    user,
  });
});

export default router;
