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
    SELECT u.id, u.name, u.email, u.division, u.status, r.role_name
    FROM users u
    LEFT JOIN roles r ON u.role_id = r.id
  `);
  res.json(rows);
});

// Tambah user
app.post('/users', async (req, res) => {
  const { name, email, password, division, roleId, status } = req.body;

  if (!name || !email || !password || !roleId) {
    return res.status(400).json({ message: 'Name, email, password, and roleId are required' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await db.execute(
    `INSERT INTO users (name, email, password, division, role_id, status)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [name, email, hashedPassword, division || null, roleId, status || 'active']
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


// ======== RISKS =============
app.get('/risks', async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT r.*, rs.role_name AS jabatan, u.division AS divisi
      FROM risks r
      LEFT JOIN users u ON r.pemilik_risiko = u.id
      LEFT JOIN roles rs ON u.role_id = rs.id
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


app.listen(5000, () => console.log('API running at http://localhost:5000'));
