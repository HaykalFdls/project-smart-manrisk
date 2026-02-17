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
    origin: "http://localhost:3000", // sesuaikan dengan port frontend
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

// 🔐 LOGOUT
app.post("/api/logout", (req, res) => {
  res.clearCookie("accessToken");
  res.json({ success: true, message: "Logged out" });
});

// ================= DASHBOARD STATS =================
app.get("/api/dashboard/stats", authenticateToken, (req, res) => {
  res.json({
    summary: {
      totalRisks: 15,
      highRisks: 3,
      mediumRisks: 7,
      lowRisks: 5,
      pendingApproval: 4
    }
  });
});

// ================= ADMIN RISK LIST =================
app.get("/api/admin/risk-list", authenticateToken, (req, res) => {
  res.json({
    success: true,
    data: [
      { id: 1, unit_name: "Unit HR", description: "Risiko operasional", score: 12, status: "pending" },
      { id: 2, unit_name: "Unit IT", description: "Risiko keamanan data", score: 18, status: "pending" },
      { id: 3, unit_name: "Unit Finance", description: "Risiko keuangan", score: 8, status: "approved" }
    ]
  });
});

// ================= ADMIN VERIFY RISK =================
app.patch("/api/admin/verify-risk", authenticateToken, (req, res) => {
  const { id, status } = req.body;
  res.json({ success: true, message: `Risk ${id} updated to ${status}` });
});

// ================= USERS =================
app.get("/users", authenticateToken, (req, res) => {
  res.json([
    { id: 1, name: "Administrator", role: "admin", unit_name: "Management" },
    { id: 2, name: "User Demo", role: "user", unit_name: "Unit HR" },
    { id: 3, name: "Staff IT", role: "user", unit_name: "Unit IT" },
  ]);
});

// ================= RISKS CRUD =================
let mockRisks = [
  { id: 1, kategori_risiko: "Operasional", jenis_risiko: "Proses", skenario_risiko: "Kegagalan sistem IT", unit_kerja: "Unit IT", status: "draft", score: 12 },
  { id: 2, kategori_risiko: "Keuangan", jenis_risiko: "Likuiditas", skenario_risiko: "Cash flow issue", unit_kerja: "Unit Finance", status: "submitted", score: 18 },
  { id: 3, kategori_risiko: "Kepatuhan", jenis_risiko: "Regulasi", skenario_risiko: "Pelanggaran kebijakan", unit_kerja: "Unit HR", status: "draft", score: 8 },
];

app.get("/risks", authenticateToken, (req, res) => {
  res.json(mockRisks);
});

app.post("/risks", authenticateToken, (req, res) => {
  const newRisk = {
    id: mockRisks.length + 1,
    ...req.body,
    status: req.body.status || "draft"
  };
  mockRisks.push(newRisk);
  res.json({ success: true, data: newRisk });
});

app.put("/risks/:id", authenticateToken, (req, res) => {
  const id = parseInt(req.params.id);
  const index = mockRisks.findIndex(r => r.id === id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: "Risk not found" });
  }
  mockRisks[index] = { ...mockRisks[index], ...req.body };
  res.json({ success: true, data: mockRisks[index] });
});

app.delete("/risks/:id", authenticateToken, (req, res) => {
  const id = parseInt(req.params.id);
  mockRisks = mockRisks.filter(r => r.id !== id);
  res.json({ success: true, message: "Risk deleted" });
});

// ================= START =================
const PORT = 5001;
app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
});
