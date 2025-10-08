import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";

import { authenticateToken } from './middleware/auth.js';

const app = express();
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:9002"], // port frontend
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

const JWT_SECRET = "access_secret_key"; // nanti taro di .env
const REFRESH_SECRET = "refresh_secret_key"; // nanti taro di .env

const db = await mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'smart_database',
});

// ======== USERS =============

// Ambil semua user + role + unit + permissions
app.get('/users', authenticateToken, async (req, res) => {
  const [rows] = await db.execute(`
    SELECT 
      u.id, 
      u.user_id, 
      u.name, 
      u.email, 
      u.unit_id, 
      u.status, 
      r.role_name,
      un.unit_name,
      rp.can_create, 
      rp.can_read, 
      rp.can_view, 
      rp.can_update, 
      rp.can_approve, 
      rp.can_delete, 
      rp.can_provision
    FROM users u
    LEFT JOIN roles r ON u.role_id = r.id
    LEFT JOIN role_permissions rp ON r.id = rp.role_id
    LEFT JOIN units un ON u.unit_id = un.id
  `);
  res.json(rows);
});


// Tambah user
app.post('/users', async (req, res) => {
  const { user_id, name, email, password, unit_id, role_id, status } = req.body;
  if (!user_id || !name || !password || !unit_id || !role_id) {
    return res.status(400).json({ message: 'Data tidak lengkap (user_id, name, password, role_id wajib)' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await db.execute(
    `INSERT INTO users (user_id, name, email, password, unit_id, role_id, status)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
     [user_id, name, email || null, hashedPassword, unit_id, role_id, status || 'active']
  );

  res.json({ message: 'User berhasil ditambahkan' });
});

// ======== ROLES =============

// Ambil semua roles + permissions
app.get('/roles', async (req, res) => {
  const [rows] = await db.execute(`
    SELECT 
      r.id, r.role_name, r.description,
      rp.can_create, rp.can_read, rp.can_view, rp.can_update,
      rp.can_approve, rp.can_delete, rp.can_provision
    FROM roles r
    LEFT JOIN role_permissions rp ON r.id = rp.role_id
  `);
  res.json(rows);
});


// ======== ROLE PERMISSIONS =============

// Ambil permission berdasarkan role
app.get('/roles/:roleId/permissions', async (req, res) => {
  const { roleId } = req.params;
  const [rows] = await db.execute(
    'SELECT * FROM role_permissions WHERE role_id = ?',
    [roleId]
  );
  res.json(rows[0] || {});
});

// Ambil permissions khusus satu role
app.get('/roles/:roleId/permissions', async (req, res) => {
  const { roleId } = req.params;
  const [rows] = await db.execute(
    `SELECT 
        rp.can_create, rp.can_read, rp.can_view, rp.can_update,
        rp.can_approve, rp.can_delete, rp.can_provision
    FROM role_permissions rp
    WHERE rp.role_id = ?`,
    [roleId]
  );
  res.json(rows[0] || {});
});

// ===========================================================
// ===================== AUTH SECTION ========================
// ===========================================================

// === LOGIN ===
app.post("/login", async (req, res) => {
  const { user_id, password } = req.body;
  try {
    const [rows] = await db.execute(
      `SELECT u.*, r.role_name, un.unit_name
       FROM users u
       LEFT JOIN roles r ON u.role_id = r.id
       LEFT JOIN units un ON u.unit_id = un.id
       WHERE u.user_id = ?`,
      [user_id]
    );

    if (rows.length === 0)
      return res.status(401).json({ message: "ID User tidak ditemukan" });

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      await db.execute(
        `INSERT INTO user_logins (user_id, ip_address, user_agent, success, role_name, unit_name)
         VALUES (?, ?, ?, 0, ?, ?)`,
        [user.id, req.ip, req.get("User-Agent"), user.role_name, user.unit_name]
      );

      console.warn(`[LOGIN FAIL] ${user_id} — Password salah (${new Date().toLocaleString()})`);
      return res.status(401).json({ message: "Password salah" });
    }

    // Ambil permissions
    const [permRows] = await db.execute(
      `SELECT can_create, can_read, can_view, can_update, can_approve, can_delete, can_provision
       FROM role_permissions WHERE role_id = ?`,
      [user.role_id]
    );
    const permissions = permRows[0] || {};

    // 🔐 Generate tokens
    const accessToken = jwt.sign(
      { id: user.id, role_id: user.role_id },
      JWT_SECRET,
      { expiresIn: "1h" }
    );
    const refreshToken = jwt.sign(
      { id: user.id, role_id: user.role_id },
      REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    // Simpan refresh token di cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 hari
    });

    // Catat login sukses
    await db.execute(
      `INSERT INTO user_logins (user_id, ip_address, user_agent, success, role_name, unit_name)
       VALUES (?, ?, ?, 1, ?, ?)`,
      [user.id, req.ip, req.get("User-Agent"), user.role_name, user.unit_name]
    );

    console.log(`[LOGIN SUCCESS] ${user_id} (${user.name}) berhasil login pada ${new Date().toLocaleString()}`);

    res.json({
      token: accessToken,
      user: {
        id: user.id,
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        role_id: user.role_id,
        role_name: user.role_name,
        unit_id: user.unit_id,
        unit_name: user.unit_name,
        status: user.status,
        permissions,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ======== REFRESH TOKEN =========
app.post("/refresh-token", async (req, res) => {
  // Ambil refreshToken dari cookie atau body
  const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
  if (!refreshToken) return res.status(401).json({ message: "Refresh token tidak ada" });

  jwt.verify(refreshToken, REFRESH_SECRET, async (err, decoded) => {
    if (err) return res.status(403).json({ message: "Refresh token tidak valid" });

    // Buat token baru
    const newToken = jwt.sign(
      { id: decoded.id, role_id: decoded.role_id },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Ambil ulang data user (agar data permissions tetap update)
    const [rows] = await db.execute(`
      SELECT u.*, r.role_name, un.unit_name,
        rp.can_create, rp.can_read, rp.can_view, rp.can_update,
        rp.can_approve, rp.can_delete, rp.can_provision
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      LEFT JOIN units un ON u.unit_id = un.id
      LEFT JOIN role_permissions rp ON r.id = rp.role_id
      WHERE u.id = ?
    `, [decoded.id]);

    if (!rows.length) return res.status(404).json({ message: "User tidak ditemukan" });

    const user = rows[0];

    res.json({
      token: newToken,
      user: {
        id: user.id,
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        role_id: user.role_id,
        role_name: user.role_name,
        unit_id: user.unit_id,
        unit_name: user.unit_name,
        status: user.status,
        permissions: {
          can_create: !!user.can_create,
          can_read: !!user.can_read,
          can_view: !!user.can_view,
          can_update: !!user.can_update,
          can_approve: !!user.can_approve,
          can_delete: !!user.can_delete,
          can_provision: !!user.can_provision,
        },
      },
    });
  });
});

// === LOGOUT ===
app.post("/logout", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    await db.execute(
      `UPDATE user_logins 
       SET logout_time = NOW() 
       WHERE user_id = ? AND logout_time IS NULL
       ORDER BY login_time DESC LIMIT 1`,
      [userId]
    );

    res.clearCookie("refreshToken");
    console.log(`[LOGOUT] User ID ${userId} logout pada ${new Date().toLocaleString()}`);
    res.json({ message: "Logout berhasil" });
  } catch (err) {
    console.error("Logout error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ======== USER LOGINS (riwayat login/logout) =========
app.get("/user-logins", authenticateToken, async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT 
        ul.id,
        ul.user_id,
        u.name AS user_name,
        u.email,
        ul.login_time,
        ul.logout_time,
        ul.ip_address,
        ul.user_agent,
        ul.role_name,
        ul.unit_name,
        u.status
      FROM user_logins ul
      JOIN users u ON ul.user_id = u.id
      ORDER BY ul.login_time DESC
    `);
    
    console.log(`[USER_LOGINS] ${rows.length} logins diambil pada ${new Date().toLocaleString()}`);
    res.json(rows);
  } catch (err) {
    console.error("Gagal mengambil data user_logins:", err);
    res.status(500).json({ message: "Gagal mengambil data user_logins" });
  }
});


// ======== PROTECTED PROFILE =========
app.get("/profile", authenticateToken, async (req, res) => {
  const [rows] = await db.execute(
    "SELECT id, user_id, name, email, role_id, unit_id, status FROM users WHERE id = ?",
    [req.user.id]
  );
  if (rows.length === 0) return res.status(404).json({ message: "User tidak ditemukan" });
  res.json(rows[0]);
});

// ======== RISKS =============
app.get('/risks', async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT r.*,
        rs.role_name AS jabatan,
        u.unit_id,
        un.unit_name AS unit_kerja,   
        u.name AS pemilik_nama 
      FROM risks r
      LEFT JOIN users u ON r.pemilik_risiko = u.id
      LEFT JOIN roles rs ON u.role_id = rs.id
      LEFT JOIN units un ON u.unit_id = un.id
      ORDER BY r.id DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal mengambil data risiko' });
  }
});


// POST risk
app.post('/risks', async (req, res) => {
  const data = req.body;
  console.log('Incoming data:', req.body); 
  const values = [
    data.kategori_risiko, data.jenis_risiko, data.skenario_risiko, data.root_cause, data.dampak, 
    data.dampak_keuangan, data.tingkat_dampak_keuangan, data.dampak_operasional, data.tingkat_dampak_operasional, 
    data.dampak_reputasi, data.tingkat_dampak_reputasi, data.dampak_regulasi, data.tingkat_dampak_regulasi, 
    data.skor_kemungkinan, data.tingkat_kemungkinan, data.nilai_risiko, data.tingkat_risiko,
    data.rencana_penanganan, data.deskripsi_rencana_penanganan, data.risiko_residual,
    data.kriteria_penerimaan_risiko, data.pemilik_risiko
  ].map(v => v === undefined ? null : v);

  const [result] = await db.execute(
    `INSERT INTO risks (
      kategori_risiko, jenis_risiko, skenario_risiko, root_cause, dampak, dampak_keuangan, tingkat_dampak_keuangan,
      dampak_operasional, tingkat_dampak_operasional, dampak_reputasi, tingkat_dampak_reputasi, dampak_regulasi, tingkat_dampak_regulasi,
      skor_kemungkinan, tingkat_kemungkinan, nilai_risiko, tingkat_risiko, rencana_penanganan, deskripsi_rencana_penanganan, risiko_residual,
      kriteria_penerimaan_risiko, pemilik_risiko
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    values
  );

  res.json({ id: result.insertId, ...data });
});

const safe = (val) => val ?? null;
// PUT risk
app.put('/risks/:id', async (req, res) => {
  const { id } = req.params;
  const data = req.body;

  const values = [
    safe(data.kategori_risiko),
    safe(data.jenis_risiko),
    safe(data.skenario_risiko),
    safe(data.root_cause),
    safe(data.dampak),
    safe(data.dampak_keuangan),
    safe(data.tingkat_dampak_keuangan),
    safe(data.dampak_operasional),
    safe(data.tingkat_dampak_operasional),
    safe(data.dampak_reputasi),
    safe(data.tingkat_dampak_reputasi),
    safe(data.dampak_regulasi),
    safe(data.tingkat_dampak_regulasi),
    safe(data.skor_kemungkinan),
    safe(data.tingkat_kemungkinan),
    safe(data.nilai_risiko),
    safe(data.tingkat_risiko),
    safe(data.rencana_penanganan),
    safe(data.deskripsi_rencana_penanganan),
    safe(data.risiko_residual),
    safe(data.kriteria_penerimaan_risiko),
    safe(data.pemilik_risiko),
    id
  ];

  try {
    await db.execute(
      `UPDATE risks SET 
        kategori_risiko=?, jenis_risiko=?, skenario_risiko=?, root_cause=?, dampak=?, 
        dampak_keuangan=?, tingkat_dampak_keuangan=?, dampak_operasional=?, tingkat_dampak_operasional=?,
        dampak_reputasi=?, tingkat_dampak_reputasi=?, dampak_regulasi=?, tingkat_dampak_regulasi=?,
        skor_kemungkinan=?, tingkat_kemungkinan=?, nilai_risiko=?, tingkat_risiko=?,
        rencana_penanganan=?, deskripsi_rencana_penanganan=?, risiko_residual=?,
        kriteria_penerimaan_risiko=?, pemilik_risiko=?
      WHERE id=?`,
      values
    );

    res.json({ id, ...data });
  } catch (err) {
    console.error('Update error:', err);
    res.status(500).json({ error: 'Gagal update risk' });
  }
});

// DELETE risk
app.delete('/risks/:id', async (req, res) => {
  const { id } = req.params;
  await db.execute(`DELETE FROM risks WHERE id=?`, [id]);
  res.json({ message: 'Risk deleted' });
});


// ======== UNITS ===========
app.get('/units', async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT id, unit_name, unit_type 
      FROM units
      ORDER BY unit_type, unit_name
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal ambil data units' });
  }
});

// GET detail unit by ID
app.get("/units/:id", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT id, unit_name, unit_type FROM units WHERE id = ?",
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: "Unit tidak ditemukan" });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal mengambil detail unit" });
  }
});


// ======== RCSA MASTER =============

// Ambil master risiko untuk unit tertentu
app.get('/rcsa/master/:unitId', async (req, res) => {
  const { unitId } = req.params;
  try {
    const [rows] = await db.execute(`
      SELECT m.id, m.rcsa_name, m.description
      FROM rcsa_master m
      JOIN rcsa_master_units mu ON m.id = mu.rcsa_master_id
      WHERE mu.unit_id = ?
    `, [unitId]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal ambil data master RCSA' });
  }
});

// ----------- CRUD MASTER RCSA ------------
// Ambil semua master RCSA (opsional: filter unit pakai query)
app.get("/master-rcsa", async (req, res) => {
  const { unit_id } = req.query;

  try {
    let query = `
      SELECT 
        m.id,
        m.rcsa_name,
        m.description,
        u.unit_name,
        u.unit_type
      FROM rcsa_master m
      LEFT JOIN rcsa_master_units mu ON m.id = mu.rcsa_master_id
      LEFT JOIN units u ON mu.unit_id = u.id
    `;
    const params = [];

    if (unit_id) {
      query += " WHERE mu.unit_id = ?";
      params.push(unit_id);
    }

    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal mengambil master RCSA" });
  }
});

// Tmambah Data Master RCSA
app.post("/master-rcsa", async (req, res) => {
  const { rcsa_name, description, unit_id } = req.body;
  const created_by = req.headers["authorization-user"]; // ambil dari header

  if (!rcsa_name || !unit_id) {
    return res.status(400).json({ message: "rcsa_name dan unit_id wajib diisi" });
  }
  if (!created_by) {
    return res.status(400).json({ message: "created_by wajib dikirim" });
  }

  try {
    // Insert ke rcsa_master
    const [result] = await db.execute(
      "INSERT INTO rcsa_master (rcsa_name, description, created_by) VALUES (?, ?, ?)",
      [rcsa_name, description || null, created_by]
    );

    const masterId = result.insertId;

    // Hubungkan dengan unit
    await db.execute(
      "INSERT INTO rcsa_master_units (rcsa_master_id, unit_id) VALUES (?, ?)",
      [masterId, unit_id]
    );

    res.json({
      id: masterId,
      rcsa_name,
      description,
      unit_id,
      created_by,
    });
  } catch (err) {
    console.error("❌ Error tambah master RCSA:", err);
    res.status(500).json({ message: "Gagal tambah master RCSA" });
  }
});

// Update master RCSA
app.put("/rcsa/master/:id", async (req, res) => {
  const { id } = req.params;
  const { rcsa_name, description, unit_id } = req.body;

  try {
    // Update hanya nama & deskripsi
    await db.execute(
      "UPDATE rcsa_master SET rcsa_name=?, description=? WHERE id=?",
      [rcsa_name, description || null, id]
    );

    // 🔹 Update unit hanya kalau unit_id valid
    if (unit_id && !isNaN(unit_id)) {
      await db.execute(
        "UPDATE rcsa_master_units SET unit_id=? WHERE rcsa_master_id=?",
        [unit_id, id]
      );
    }

    res.json({ message: "Master RCSA updated successfully" });
  } catch (err) {
    console.error("Error updating RCSA Master:", err);
    res.status(500).json({ error: "Gagal update Master RCSA" });
  }
});


// Hapus master RCSA
app.delete('/master-rcsa/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.execute('DELETE FROM rcsa_master_units WHERE rcsa_master_id=?', [id]);
    await db.execute('DELETE FROM rcsa_master WHERE id=?', [id]);
    res.json({ message: 'Master RCSA berhasil dihapus' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal hapus master RCSA' });
  }
});

// ======== RCSA ASSESSMENT =============

// Ambil semua assessment submitted (filter by user/unit/status)
app.get("/rcsa/assessment", async (req, res) => {
  try {
    const { created_by, unit_id } = req.query;

    let sql = `
      SELECT 
        ra.*, 
        u.unit_name, u.unit_type,
        rm.rcsa_name, rm.description AS rcsa_description
      FROM rcsa_assessment ra
      JOIN rcsa_master rm ON rm.id = ra.rcsa_master_id
      JOIN units u ON u.id = ra.unit_id
      WHERE ra.status = 'submitted'
    `;
    const params = [];

    if (created_by) {
      sql += " AND ra.created_by = ?";
      params.push(created_by);
    }
    if (unit_id) {
      sql += " AND ra.unit_id = ?";
      params.push(unit_id);
    }

    sql += " ORDER BY ra.id ASC";

    // gunakan db.execute bukan pool
    const [rows] = await db.execute(sql, params);
    res.json(rows);
  } catch (err) {
    console.error("GET /rcsa/assessment error:", err);
    res.status(500).json({ error: err.message });
  }
});



// Ambil assessment draft
app.get("/rcsa/assessment/drafts", async (req, res) => {
  try {
    const { created_by, unit_id, exclude_submitted } = req.query;

    let sql = `
      SELECT 
          rmu.rcsa_master_id,
          rm.rcsa_name,
          rm.description,
          rmu.unit_id,
          ra.id AS assessment_id,
          ra.status,
          ra.potensi_risiko,
          ra.penyebab_risiko,
          ra.dampak_inheren,
          ra.frekuensi_inheren,
          ra.nilai_inheren,
          ra.level_inheren,
          ra.pengendalian,
          ra.dampak_residual,
          ra.kemungkinan_residual,
          ra.nilai_residual,
          ra.level_residual,
          ra.penilaian_kontrol,
          ra.action_plan,
          ra.pic
      FROM rcsa_master_units rmu
      JOIN rcsa_master rm ON rm.id = rmu.rcsa_master_id
      LEFT JOIN rcsa_assessment ra 
        ON ra.rcsa_master_id = rmu.rcsa_master_id 
       AND ra.unit_id = rmu.unit_id
       AND ra.created_by = ?
      WHERE rmu.unit_id = ?
    `;

    const params = [created_by, unit_id];

    if (exclude_submitted === "true") {
      sql += ` AND (ra.status IS NULL OR ra.status = 'draft') `;
    }

    sql += ` ORDER BY rmu.rcsa_master_id ASC`;

    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching RCSA drafts" });
  }
});


// Ambil detail assessment by ID
app.get('/rcsa/assessment/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.execute(`
      SELECT 
        ra.*,
        rm.id AS master_id, rm.rcsa_name, rm.description AS master_desc,
        u.id AS unit_id, u.unit_name, u.unit_type,
        usr.id AS user_id, usr.name AS user_name, usr.email AS user_email
      FROM rcsa_assessment ra
      JOIN rcsa_master rm ON ra.rcsa_master_id = rm.id
      JOIN units u ON ra.unit_id = u.id
      JOIN users usr ON ra.created_by = usr.id
      WHERE ra.id = ?
    `, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Assessment tidak ditemukan" });
    }

    const r = rows[0];
    const [notes] = await db.execute(`
      SELECT rn.id, rn.note, rn.created_at, u.id AS reviewer_id, u.name AS reviewer_name
      FROM rcsa_review_notes rn
      JOIN users u ON rn.reviewer_id = u.id
      WHERE rn.assessment_id = ?
    `, [id]);

    const formatted = {
      id: r.id,
      status: r.status,
      created_at: r.created_at,
      updated_at: r.updated_at,
      rcsa_master: {
        id: r.master_id,
        rcsa_name: r.rcsa_name,
        description: r.master_desc
      },
      unit: {
        id: r.unit_id,
        unit_name: r.unit_name,
        unit_type: r.unit_type
      },
      created_by: {
        id: r.user_id,
        name: r.user_name,
        email: r.user_email
      },
      assessment: {
        jenis_risiko: r.jenis_risiko,
        risk_description: r.risk_description,
        penyebab_risiko: r.penyebab_risiko,
        dampak_inheren: r.dampak_inheren,
        frekuensi_inheren: r.frekuensi_inheren,
        nilai_inheren: r.nilai_inheren,
        level_inheren: r.level_inheren,
        pengendalian: r.pengendalian,
        dampak_residual: r.dampak_residual,
        kemungkinan_residual: r.kemungkinan_residual,
        nilai_residual: r.nilai_residual,
        level_residual: r.level_residual,
        penilaian_kontrol: r.penilaian_kontrol,
        action_plan: r.action_plan,
        pic: r.pic
      },
      review_notes: notes.map(n => ({
        id: n.id,
        note: n.note,
        created_at: n.created_at,
        reviewer: {
          id: n.reviewer_id,
          name: n.reviewer_name
        }
      }))
    };

    res.json({ success: true, data: formatted });
  } catch (err) {
    console.error("❌ Error ambil detail assessment:", err);
    res.status(500).json({ message: 'Gagal ambil detail assessment' });
  }
});

// Update assessment draft
app.put('/rcsa/assessment/:id', async (req, res) => {
  const { id } = req.params;
  let data = req.body;

  Object.keys(data).forEach(k => {
    if (data[k] === undefined) data[k] = null;
  });

  try {
    console.log("Update payload:", data);

    await db.execute(`
      UPDATE rcsa_assessment SET
        rcsa_master_id = ?, unit_id = ?, created_by = ?,
        potensi_risiko = ?, jenis_risiko = ?, penyebab_risiko = ?,
        dampak_inheren = ?, frekuensi_inheren = ?, pengendalian = ?,
        dampak_residual = ?, kemungkinan_residual = ?, penilaian_kontrol = ?,
        action_plan = ?, pic = ?, status = ?
      WHERE id = ?`, [
      data.rcsa_master_id ?? null,
      data.unit_id ?? null,
      data.created_by ?? null,
      data.potensi_risiko ?? null,
      data.jenis_risiko ?? null,
      data.penyebab_risiko ?? null,
      data.dampak_inheren ?? null,
      data.frekuensi_inheren ?? null,
      data.pengendalian ?? null,
      data.dampak_residual ?? null,
      data.kemungkinan_residual ?? null,
      data.penilaian_kontrol ?? null,
      data.action_plan ?? null,
      data.pic ?? null,
      data.status ?? 'draft',
      id
    ]);

    res.json({ ...data, id });
  } catch (err) {
    console.error("❌ Error update assessment:", err);
    res.status(500).json({ message: 'Gagal update assessment' });
  }
});


app.post('/rcsa/assessment', async (req, res) => {
  const data = req.body;
  try {
    // cek apakah sudah ada assessment untuk kombinasi ini
    const [existing] = await db.execute(`
      SELECT id, status FROM rcsa_assessment
      WHERE rcsa_master_id = ? AND unit_id = ? AND created_by = ?
      ORDER BY id DESC LIMIT 1
    `, [data.rcsa_master_id, data.unit_id, data.created_by]);

    if (existing.length > 0) {
      const current = existing[0];

      if (current.status === 'submitted') {
        return res.status(400).json({
          success: false,
          message: 'Assessment sudah submitted, tidak bisa membuat draft baru.'
        });
      }
      return res.json({
        ...data,
        id: current.id,
        status: current.status
      });
    }

    // kalau belum ada, insert baru
    const [result] = await db.execute(`
      INSERT INTO rcsa_assessment (
        rcsa_master_id, unit_id, created_by,
        jenis_risiko, potensi_risiko, penyebab_risiko,
        dampak_inheren, frekuensi_inheren, nilai_inheren, level_inheren,
        pengendalian,
        dampak_residual, kemungkinan_residual, nilai_residual, level_residual,
        penilaian_kontrol, action_plan, pic,
        status
      ) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      data.rcsa_master_id ?? null,
      data.unit_id ?? null,
      data.created_by ?? null,
      data.jenis_risiko ?? null,
      data.potensi_risiko ?? null,
      data.penyebab_risiko ?? null,
      data.dampak_inheren ?? null,
      data.frekuensi_inheren ?? null,
      data.nilai_inheren ?? null,
      data.level_inheren ?? null,
      data.pengendalian ?? null,
      data.dampak_residual ?? null,
      data.kemungkinan_residual ?? null,
      data.nilai_residual ?? null,
      data.level_residual ?? null,
      data.penilaian_kontrol ?? null,
      data.action_plan ?? null,
      data.pic ?? null,
      data.status ?? 'draft'
    ]);

    res.json({ ...data, id: result.insertId, status: data.status ?? 'draft' });
  } catch (err) {
    console.error("❌ Error insert assessment:", err);
    res.status(500).json({ message: 'Gagal simpan assessment' });
  }
});


//submit Assessment
app.put('/rcsa/assessment/:id/submit', async (req, res) => {
  const { id } = req.params;
  try {
    await db.execute(`UPDATE rcsa_assessment SET status='submitted' WHERE id=?`, [id]);
    res.json({ message: 'Assessment berhasil di-submit' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal submit assessment' });
  }
});

// ======== RCSA REVIEW =============
app.post('/rcsa/review/:assessmentId', async (req, res) => {
  const { assessmentId } = req.params;
  const { reviewer_id, note, status } = req.body; // status: approved/rejected

  try {
    await db.execute(`
      INSERT INTO rcsa_review_notes (assessment_id, reviewer_id, note, status) 
      VALUES (?, ?, ?, ?)
    `, [assessmentId, reviewer_id, note, status]);

    await db.execute(`UPDATE rcsa_assessment SET status=? WHERE id=?`, [status, assessmentId]);

    res.json({ message: 'Review berhasil disimpan' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal simpan review' });
  }
});





app.listen(5000, () => console.log('API running at http://localhost:5000'));