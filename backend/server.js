import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';

const app = express();
app.use(cors());
app.use(express.json());

const db = await mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'smart_database',
});

// ======== USERS =============

// Ambil semua user
app.get('/users', async (req, res) => {
  const [rows] = await db.execute(`
    SELECT u.id, u.name, u.email, u.unit_id, u.status, r.role_name
    FROM users u
    LEFT JOIN roles r ON u.role_id = r.id
  `);
  res.json(rows);
});

// Tambah user
app.post('/users', async (req, res) => {
  const { name, email, password, unit_id, role_id, status } = req.body;
  console.log("Req Body: ", req.body);
  if (!name || !email || !password || !role_id) {
    return res.status(400).json({ message: 'Name, email, password, and roleId are required' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await db.execute(
    `INSERT INTO users (name, email, password, unit_id, role_id, status)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [name, email, hashedPassword, unit_id || null, role_id, status || 'active']
  );

  res.json({ message: 'User berhasil ditambahkan' });
});

// ======== ROLES =============

// Ambil semua roles
app.get('/roles', async (req, res) => {
  const [rows] = await db.execute('SELECT * FROM roles');
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


// ======== LOGIN =============
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Cari user berdasarkan email
    const [rows] = await db.execute(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: "Email tidak ditemukan" });
    }

    const user = rows[0];

    // Cek password dengan bcrypt
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Password salah" });
    }

    // Kalau berhasil login
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role_id: user.role_id,
      unit_id: user.unit_id,
      status: user.status,
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ======== RISKS =============
app.get('/risks', async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT r.*,
        rs.role_name AS jabatan,
        u.unit_id,
        un.unit_name AS divisi,   
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
  // ubah undefined menjadi null
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

// ======== CRUD MASTER RCSA =============

// Ambil semua master RCSA (opsional: filter unit pakai query)
app.get("/master-rcsa", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        m.id,
        m.rcsa_name,
        m.description,
        u.unit_name,
        u.unit_type
      FROM rcsa_master m
      LEFT JOIN rcsa_master_units mu ON m.id = mu.rcsa_master_id
      LEFT JOIN units u ON mu.unit_id = u.id
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal mengambil master RCSA" });
  }
});


// Tambah master RCSA
app.post('/master-rcsa', async (req, res) => {
  const { rcsa_name, description, unit_id  } = req.body;
  console.log("REQ BODY:", req.body);

  const created_by = req.headers["authorization-user"];

  if (!created_by) {
      return res.status(400).json({ message: "User ID tidak ditemukan di header" });
    }
  
    try {
      const [result] = await db.execute(
        'INSERT INTO rcsa_master (rcsa_name, description, created_by) VALUES (?, ?, ?)',
        [rcsa_name, description, created_by]
      );
    
      await db.execute(
        'INSERT INTO rcsa_master_units (rcsa_master_id, unit_id) VALUES (?, ?)',
        [result.insertId, unit_id]
      );
    
      res.json({ id: result.insertId, rcsa_name, description, unit_id, created_by });
    } catch (err) {
      console.error("createMasterRCSA error:", err);
      res.status(500).json({ message: "Gagal tambah master RCSA" });
    }
});

// Update master RCSA
app.put('/master-rcsa/:id', async (req, res) => {
  const { id } = req.params;
  const { rcsa_name, description, unit_id } = req.body;
  try {
    await db.execute(
      'UPDATE rcsa_master SET rcsa_name=?, description=? WHERE id=?',
      [rcsa_name, description, id]
    );
    if (unit_id) {
      await db.execute(
        'UPDATE rcsa_master_units SET unit_id=? WHERE rcsa_master_id=?',
        [unit_id, id]
      );
    }
    res.json({ id, rcsa_name, description, unit_id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal update master RCSA' });
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
app.post('/rcsa/assessment', async (req, res) => {
  const data = req.body;
  try {
    const [result] = await db.execute(`
      INSERT INTO rcsa_assessment 
      (rcsa_master_id, unit_id, created_by, risk_description, dampak_inheren, frekuensi_inheren, pengendalian, status) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      data.rcsa_master_id, 
      data.unit_id, 
      data.created_by, 
      data.risk_description, 
      data.dampak_inheren, 
      data.frekuensi_inheren, 
      data.pengendalian, 
      data.status || 'draft'
    ]);
    res.json({ id: result.insertId, ...data });
  } catch (err) {
    console.error(err);
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
