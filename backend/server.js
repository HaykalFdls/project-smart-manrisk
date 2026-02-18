import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import XLSX from "xlsx";

import authRoutes from "./routes/auth.js";
import authenticateToken, { authorizeRoles, authorizePermission } from "./middleware/auth.js";
import pool from "./config/db.js";

const app = express();

// Risk status normalizer:
// API may receive legacy/new labels, but DB column `risks.status`
// only allows: draft, final, reviewed, approved, rejected.
const RISK_STATUS_MAP = {
  draft: "draft",
  submitted: "final",
  pending_approval: "final",
  final: "final",
  reviewed: "reviewed",
  rejected: "rejected",
  declined: "rejected",
  approved: "approved",
  published: "approved",
};

const DB_RISK_STATUS = ["draft", "final", "reviewed", "approved", "rejected"];
const APPROVER_ROLES = ["Super User", "Administrator", "Supervisor", "Executive Reviewer"];

const hasPermissionValue = (value) => {
  if (value === true || value === 1) return true;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    return normalized === "1" || normalized === "true";
  }
  if (Buffer.isBuffer(value)) {
    return value.length > 0 && value[0] === 1;
  }
  return false;
};

const isApproverUser = (user = {}) => {
  const canApprove = hasPermissionValue(user?.permissions?.can_approve);
  return canApprove || APPROVER_ROLES.includes(user?.role_name);
};

const authorizeApproverAccess = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: "Silakan login terlebih dahulu" });
  }
  if (!isApproverUser(req.user)) {
    return res.status(403).json({ success: false, message: "Akses approver diperlukan" });
  }
  next();
};

app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: "http://localhost:9002", // sesuaikan dengan port frontend
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
app.get("/api/dashboard/stats", authenticateToken, async (req, res) => {
  try {
    const isApprover = isApproverUser(req.user);
    const filters = [];
    const values = [];

    if (!isApprover) {
      filters.push("ur.unit_id = ?");
      values.push(req.user.unit_id || 0);
    }

    const whereClause = filters.length ? `WHERE ${filters.join(" AND ")}` : "";

    const [rows] = await pool.execute(
      `SELECT r.id, r.tingkat_risiko, r.status, r.kategori_risiko, un.unit_name
       FROM risks r
       LEFT JOIN users ur ON r.pemilik_risiko = ur.id
       LEFT JOIN units un ON ur.unit_id = un.id
       ${whereClause}`,
      values
    );

    const levelCounts = { high: 0, medium: 0, low: 0 };
    const statusCounts = { draft: 0, final: 0, reviewed: 0, approved: 0, rejected: 0 };
    const unitMap = {};
    const categoryMap = {};

    rows.forEach((r) => {
      const level = String(r.tingkat_risiko || "").toLowerCase();
      if (level.includes("sangat tinggi") || level.includes("high") || level.includes("tinggi")) {
        levelCounts.high += 1;
      } else if (level.includes("medium") || level.includes("menengah") || level.includes("sedang")) {
        levelCounts.medium += 1;
      } else if (level.includes("low") || level.includes("rendah")) {
        levelCounts.low += 1;
      }

      const status = String(r.status || "").toLowerCase();
      if (statusCounts[status] !== undefined) {
        statusCounts[status] += 1;
      }

      const unitName = r.unit_name || "Unknown";
      unitMap[unitName] = (unitMap[unitName] || 0) + 1;

      const category = r.kategori_risiko || "Tanpa Kategori";
      categoryMap[category] = (categoryMap[category] || 0) + 1;
    });

    res.json({
      summary: {
        totalRisks: rows.length,
        highRisks: levelCounts.high,
        mediumRisks: levelCounts.medium,
        lowRisks: levelCounts.low,
        pendingApproval: statusCounts.final,
        inProgress: statusCounts.reviewed,
        resolved: statusCounts.approved,
      },
      charts: {
        byLevel: [
          { name: "High", value: levelCounts.high },
          { name: "Medium", value: levelCounts.medium },
          { name: "Low", value: levelCounts.low },
        ],
        byStatus: [
          { name: "Draft", value: statusCounts.draft },
          { name: "Final", value: statusCounts.final },
          { name: "Reviewed", value: statusCounts.reviewed },
          { name: "Approved", value: statusCounts.approved },
          { name: "Rejected", value: statusCounts.rejected },
        ],
        byUnit: Object.entries(unitMap).map(([name, value]) => ({ name, value })),
        byCategory: Object.entries(categoryMap).map(([name, value]) => ({ name, value })),
      },
      meta: {
        scope: isApprover ? "all" : "unit",
        unit_name: req.user.unit_name || null,
      },
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({ success: false, message: "Error fetching stats" });
  }
});

// ================= ADMIN RISK LIST =================
// 🔐 ADMIN ONLY - Super User atau Administrator
app.get("/api/admin/risk-list", 
  authenticateToken, 
  authorizeApproverAccess,
  async (req, res) => {
  try {
    const [data] = await pool.execute(
      `SELECT r.id, r.kategori_risiko, r.jenis_risiko, r.skenario_risiko, 
              r.nilai_risiko, r.tingkat_risiko, r.status, r.pemilik_risiko,
              un.unit_name, r.created_at
       FROM risks r
       LEFT JOIN users ur ON r.pemilik_risiko = ur.id
       LEFT JOIN units un ON ur.unit_id = un.id
       ORDER BY r.created_at DESC`
    );

    res.json({
      success: true,
      data: data.map(r => ({
        id: r.id,
        unit_name: r.unit_name || "Unknown",
        description: r.skenario_risiko || r.jenis_risiko,
        score: r.nilai_risiko || 0,
        status: r.status,
        kategori_risiko: r.kategori_risiko,
        jenis_risiko: r.jenis_risiko,
        tingkat_risiko: r.tingkat_risiko,
        pemilik_risiko: r.pemilik_risiko
      }))
    });
  } catch (error) {
    console.error("Admin risk list error:", error);
    res.status(500).json({ success: false, message: "Error fetching risk list" });
  }
});

// ================= EXPORT APPROVED RISKS =================
// 🔐 ADMIN/APPROVER ONLY - Export data risk approved ke Excel
app.get("/api/approved-risks/export",
  authenticateToken,
  authorizeApproverAccess,
  async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT r.id, r.kategori_risiko, r.jenis_risiko, r.skenario_risiko,
              r.tingkat_risiko, r.nilai_risiko, r.status, r.created_at, r.updated_at,
              un.unit_name, ur.name AS pemilik_nama
       FROM risks r
       LEFT JOIN users ur ON r.pemilik_risiko = ur.id
       LEFT JOIN units un ON ur.unit_id = un.id
       WHERE r.status = 'approved'
       ORDER BY r.updated_at DESC`
    );

    const exportRows = rows.map((r, idx) => ({
      No: idx + 1,
      ID: r.id,
      Unit: r.unit_name || "-",
      Pemilik: r.pemilik_nama || "-",
      Kategori_Risiko: r.kategori_risiko || "-",
      Jenis_Risiko: r.jenis_risiko || "-",
      Skenario_Risiko: r.skenario_risiko || "-",
      Nilai_Risiko: r.nilai_risiko ?? "-",
      Tingkat_Risiko: r.tingkat_risiko || "-",
      Status: r.status || "-",
      Created_At: r.created_at,
      Updated_At: r.updated_at,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Approved Risks");

    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", "attachment; filename=approved_risks.xlsx");
    res.status(200).send(buffer);
  } catch (error) {
    console.error("Export approved risks error:", error);
    res.status(500).json({ success: false, message: "Error exporting approved risks" });
  }
});

// ================= ADMIN VERIFY RISK =================
// 🔐 ADMIN ONLY - Hanya role dengan permission can_approve
app.patch("/api/admin/verify-risk", 
  authenticateToken, 
  authorizeApproverAccess,
  async (req, res) => {
  try {
    const { id, status } = req.body;

    if (!id || !status) {
      return res.status(400).json({ success: false, message: "ID dan status wajib diisi" });
    }

    const statusKey = String(status).toLowerCase();
    const normalizedStatus = RISK_STATUS_MAP[statusKey];

    if (!normalizedStatus) {
      return res.status(400).json({ 
        success: false, 
        message: `Status tidak valid. Gunakan salah satu status DB: ${DB_RISK_STATUS.join(', ')}`
      });
    }

    const [result] = await pool.execute(
      `UPDATE risks SET status = ?, updated_at = NOW(), last_updated_by = ? WHERE id = ?`,
      [normalizedStatus, req.user.id, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Risk tidak ditemukan" });
    }

    res.json({ 
      success: true, 
      message: `Risk ${id} berhasil diupdate ke status ${normalizedStatus}`
    });
  } catch (error) {
    console.error("Verify risk error:", error);
    res.status(500).json({ success: false, message: "Error updating risk" });
  }
});

// ================= USERS =================
// 🔐 ADMIN ONLY - Hanya Super User atau Administrator
app.get("/users", 
  authenticateToken, 
  authorizeRoles(['Super User', 'Administrator']), 
  async (req, res) => {
  try {
    const [data] = await pool.execute(
      `SELECT u.id, u.user_id, u.name, u.email, u.status, 
              r.role_name, un.unit_name
       FROM users u
       LEFT JOIN roles r ON u.role_id = r.id
       LEFT JOIN units un ON u.unit_id = un.id
       ORDER BY u.created_at DESC`
    );

    res.json({
      success: true,
      data: data
    });
  } catch (error) {
    console.error("Users list error:", error);
    res.status(500).json({ success: false, message: "Error fetching users" });
  }
});

// ================= RISKS CRUD =================

// 📖 READ RISKS - Semua user yang authenticated bisa baca
app.get("/risks", 
  authenticateToken, 
  async (req, res) => {
  try {
    const isApprover = isApproverUser(req.user);
    const filters = [];
    const values = [];

    if (!isApprover) {
      filters.push("ur.unit_id = ?");
      values.push(req.user.unit_id || 0);
    }

    const whereClause = filters.length ? `WHERE ${filters.join(" AND ")}` : "";

    const [data] = await pool.execute(
      `SELECT r.*, un.unit_name
       FROM risks r
       LEFT JOIN users ur ON r.pemilik_risiko = ur.id
       LEFT JOIN units un ON ur.unit_id = un.id
       ${whereClause}
       ORDER BY r.created_at DESC`
      ,
      values
    );

    res.json({
      success: true,
      data: data
    });
  } catch (error) {
    console.error("Risks list error:", error);
    res.status(500).json({ success: false, message: "Error fetching risks" });
  }
});

// ✏️ CREATE RISKS - User dengan permission can_create
app.post("/risks", 
  authenticateToken, 
  authorizePermission('can_create'),
  async (req, res) => {
  try {
    const {
      kategori_risiko, jenis_risiko, skenario_risiko, root_cause, dampak,
      dampak_keuangan, tingkat_dampak_keuangan, dampak_operasional, tingkat_dampak_operasional,
      dampak_reputasi, tingkat_dampak_reputasi, dampak_regulasi, tingkat_dampak_regulasi,
      skor_kemungkinan, tingkat_kemungkinan, nilai_risiko, tingkat_risiko,
      rencana_penanganan, deskripsi_rencana_penanganan, risiko_residual,
      kriteria_penerimaan_risiko
    } = req.body;

    const ownerId = req.user.id;

    const [result] = await pool.execute(
      `INSERT INTO risks 
       (kategori_risiko, jenis_risiko, skenario_risiko, root_cause, dampak,
        dampak_keuangan, tingkat_dampak_keuangan, dampak_operasional, tingkat_dampak_operasional,
        dampak_reputasi, tingkat_dampak_reputasi, dampak_regulasi, tingkat_dampak_regulasi,
        skor_kemungkinan, tingkat_kemungkinan, nilai_risiko, tingkat_risiko,
        rencana_penanganan, deskripsi_rencana_penanganan, risiko_residual,
        kriteria_penerimaan_risiko, pemilik_risiko, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [kategori_risiko, jenis_risiko, skenario_risiko, root_cause, dampak,
       dampak_keuangan, tingkat_dampak_keuangan, dampak_operasional, tingkat_dampak_operasional,
       dampak_reputasi, tingkat_dampak_reputasi, dampak_regulasi, tingkat_dampak_regulasi,
       skor_kemungkinan, tingkat_kemungkinan, nilai_risiko, tingkat_risiko,
       rencana_penanganan, deskripsi_rencana_penanganan, risiko_residual,
       kriteria_penerimaan_risiko, ownerId, 'draft']
    );

    res.json({ 
      success: true, 
      message: "Risk created successfully",
      id: result.insertId
    });
  } catch (error) {
    console.error("Create risk error:", error);
    res.status(500).json({ success: false, message: "Error creating risk" });
  }
});

// ✏️ UPDATE RISKS - User dengan permission can_update
app.put("/risks/:id", 
  authenticateToken, 
  authorizePermission('can_update'),
  async (req, res) => {
  try {
    const { id } = req.params;
    const isApprover = isApproverUser(req.user);
    const [riskRows] = await pool.execute(
      `SELECT r.id, r.status, ur.unit_id AS owner_unit_id
       FROM risks r
       LEFT JOIN users ur ON r.pemilik_risiko = ur.id
       WHERE r.id = ?`,
      [id]
    );

    if (riskRows.length === 0) {
      return res.status(404).json({ success: false, message: "Risk not found" });
    }

    const risk = riskRows[0];
    const sameUnit = Number(risk.owner_unit_id) === Number(req.user.unit_id);

    if (!isApprover && !sameUnit) {
      return res.status(403).json({ success: false, message: "Anda hanya bisa mengubah risk divisi sendiri" });
    }

    if (!isApprover && String(risk.status).toLowerCase() === "approved") {
      return res.status(403).json({ success: false, message: "Risk yang sudah approved tidak bisa diedit oleh staff" });
    }

    const allowedFields = [
      "kategori_risiko", "jenis_risiko", "skenario_risiko", "root_cause", "dampak",
      "dampak_keuangan", "tingkat_dampak_keuangan", "dampak_operasional", "tingkat_dampak_operasional",
      "dampak_reputasi", "tingkat_dampak_reputasi", "dampak_regulasi", "tingkat_dampak_regulasi",
      "skor_kemungkinan", "tingkat_kemungkinan", "nilai_risiko", "tingkat_risiko",
      "rencana_penanganan", "deskripsi_rencana_penanganan", "risiko_residual",
      "kriteria_penerimaan_risiko", "pemilik_risiko", "status"
    ];

    const updates = {};
    Object.entries(req.body || {}).forEach(([key, value]) => {
      if (allowedFields.includes(key)) updates[key] = value;
    });

    if (!isApprover) {
      // Staff hanya boleh submit ke final (selain edit field konten)
      if (updates.status !== undefined) {
        const s = String(updates.status || "").toLowerCase();
        updates.status = (s === "final" || s === "submitted" || s === "pending_approval") ? "final" : undefined;
        if (updates.status === undefined) delete updates.status;
      }
      // Staff tidak boleh memindahkan ownership lintas user dari payload langsung
      delete updates.pemilik_risiko;
    } else if (updates.status !== undefined) {
      const mapped = RISK_STATUS_MAP[String(updates.status).toLowerCase()];
      if (!mapped) {
        return res.status(400).json({ success: false, message: "Status tidak valid" });
      }
      updates.status = mapped;
    }

    const updateKeys = Object.keys(updates);
    if (updateKeys.length === 0) {
      return res.status(400).json({ success: false, message: "Tidak ada field yang dapat diupdate" });
    }

    const fields = updateKeys.map(key => `${key} = ?`).join(", ");
    const values = updateKeys.map((k) => updates[k]);
    values.push(req.user.id, id);

    await pool.execute(
      `UPDATE risks SET ${fields}, updated_at = NOW(), last_updated_by = ? WHERE id = ?`,
      values
    );

    res.json({ success: true, message: "Risk updated successfully" });
  } catch (error) {
    console.error("Update risk error:", error);
    res.status(500).json({ success: false, message: "Error updating risk" });
  }
});

// 🗑️ DELETE RISKS - User dengan permission can_delete
app.delete("/risks/:id", 
  authenticateToken, 
  authorizePermission('can_delete'),
  async (req, res) => {
  try {
    const { id } = req.params;
    const isApprover = isApproverUser(req.user);

    const [check] = await pool.execute(
      `SELECT r.id, r.status, ur.unit_id AS owner_unit_id
       FROM risks r
       LEFT JOIN users ur ON r.pemilik_risiko = ur.id
       WHERE r.id = ?`,
      [id]
    );
    
    if (check.length === 0) {
      return res.status(404).json({ success: false, message: "Risk not found" });
    }

    const risk = check[0];
    const sameUnit = Number(risk.owner_unit_id) === Number(req.user.unit_id);
    const isDraft = String(risk.status || "").toLowerCase() === "draft";

    if (!isApprover) {
      if (!sameUnit) {
        return res.status(403).json({ success: false, message: "Anda hanya bisa menghapus risk divisi sendiri" });
      }
      if (!isDraft) {
        return res.status(403).json({ success: false, message: "Staff hanya bisa menghapus risk berstatus draft" });
      }
    }

    await pool.execute("DELETE FROM risks WHERE id = ?", [id]);

    res.json({ success: true, message: "Risk deleted successfully" });
  } catch (error) {
    console.error("Delete risk error:", error);
    res.status(500).json({ success: false, message: "Error deleting risk" });
  }
});

// ================= START =================
const PORT = 5001;
app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
});
