// ============================
// IMPORT
// ============================
const express = require('express');
const cors = require('cors');
const pool = require('./db');

const multer = require('multer');
const path = require('path');
const fs = require('fs');

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// ============================
// APP INIT
// ============================
const app = express();
const port = 5001;
const JWT_SECRET = 'secret_k3_app';

// ============================
// MIDDLEWARE
// ============================
app.use(cors());
app.use(express.json());

// ============================
// UPLOAD SETUP
// ============================
const uploadBaseDir = path.join(__dirname, 'uploads');
const temuanUploadDir = path.join(uploadBaseDir, 'temuan');

if (!fs.existsSync(temuanUploadDir)) {
  fs.mkdirSync(temuanUploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, temuanUploadDir),
  filename: (_, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/\s+/g, '_');
    cb(null, `${base}-${Date.now()}${ext}`);
  }
});

const upload = multer({ storage });

app.use('/uploads', express.static(uploadBaseDir));

// ============================
// BASIC ROUTE
// ============================
app.get('/', (_, res) => {
  res.send('Backend Sistem K3 berjalan');
});

// ============================
// AUTH LOGIN
// ============================
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );

    if (result.rowCount === 0) {
      return res.status(401).json({ message: 'Login gagal' });
    }

    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password_hash);

    if (!match) {
      return res.status(401).json({ message: 'Login gagal' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        nama: user.nama,
        role: user.role
      }
    });

  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ============================
// LAPORAN INSIDEN (LAGGING)
// ============================
app.get('/api/laporan', async (_, res) => {
  const result = await pool.query(
    'SELECT * FROM laporan_insiden ORDER BY tanggal_kejadian DESC'
  );
  res.json({ data: result.rows });
});

app.post('/api/laporan', async (req, res) => {
  const {
    tanggal_kejadian,
    lokasi,
    jenis_insiden,
    deskripsi,
    status_laporan
  } = req.body;

  const result = await pool.query(
    `INSERT INTO laporan_insiden
     (tanggal_kejadian, lokasi, jenis_insiden, deskripsi, status_laporan)
     VALUES ($1,$2,$3,$4,$5)
     RETURNING *`,
    [tanggal_kejadian, lokasi, jenis_insiden, deskripsi, status_laporan]
  );

  res.status(201).json({ data: result.rows[0] });
});

// ============================
// AKTIVITAS K3 (LEADING)
// ============================
app.get('/api/aktivitas-k3', async (_, res) => {
  const result = await pool.query(
    'SELECT * FROM aktivitas_k3 ORDER BY tanggal_aktivitas DESC'
  );
  res.json({ data: result.rows });
});

app.post('/api/aktivitas-k3', async (req, res) => {
  const {
    tanggal_aktivitas,
    lokasi,
    jenis_aktivitas,
    deskripsi,
    pic,
    jumlah_peserta
  } = req.body;

  const result = await pool.query(
    `INSERT INTO aktivitas_k3
     (tanggal_aktivitas, lokasi, jenis_aktivitas, deskripsi, pic, jumlah_peserta)
     VALUES ($1,$2,$3,$4,$5,$6)
     RETURNING *`,
    [tanggal_aktivitas, lokasi, jenis_aktivitas, deskripsi, pic, jumlah_peserta]
  );

  res.status(201).json({ data: result.rows[0] });
});

// ============================
// TEMUAN LAPANGAN
// ============================
app.get('/api/temuan', async (_, res) => {
  const result = await pool.query(
    'SELECT * FROM temuan_lapangan ORDER BY tanggal_temuan DESC'
  );
  res.json({ data: result.rows });
});

// 🔹 STEP 3 — DATA VERIFIED (DASHBOARD & REKAP)
app.get('/api/temuan/verified', async (_, res) => {
  const result = await pool.query(
    `SELECT * FROM temuan_lapangan
     WHERE verification_status = 'verified'
     ORDER BY tanggal_temuan DESC`
  );
  res.json({ data: result.rows });
});

app.post('/api/temuan', async (req, res) => {
  const {
    tanggal_temuan,
    lokasi,
    sumber_temuan,
    deskripsi,
    kategori_bahaya,
    tingkat_risiko,
    tindakan_perbaikan,
    pic,
    due_date
  } = req.body;

  const result = await pool.query(
    `INSERT INTO temuan_lapangan
     (tanggal_temuan, lokasi, sumber_temuan, deskripsi,
      kategori_bahaya, tingkat_risiko, tindakan_perbaikan,
      pic, due_date, status_temuan)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'Open')
     RETURNING *`,
    [
      tanggal_temuan,
      lokasi,
      sumber_temuan,
      deskripsi,
      kategori_bahaya,
      tingkat_risiko,
      tindakan_perbaikan,
      pic,
      due_date
    ]
  );

  res.status(201).json({ data: result.rows[0] });
});

// ============================
// VERIFIKASI ADMIN (PENTING)
// ============================
app.put('/api/temuan/:id/verify', async (req, res) => {
  const { id } = req.params;
  const {
    verification_status,
    verification_comment,
    verified_by
  } = req.body;

  const result = await pool.query(
    `UPDATE temuan_lapangan
     SET verification_status = $1,
         verification_comment = $2,
         verified_by = $3,
         verified_at = NOW()
     WHERE id = $4
     RETURNING *`,
    [verification_status, verification_comment, verified_by, id]
  );

  res.json({ data: result.rows[0] });
});

// ============================
// LAMPIRAN TEMUAN (MULTI FOTO)
// ============================
app.post('/api/temuan/:id/lampiran', upload.array('files', 10), async (req, res) => {
  const { id } = req.params;
  const files = req.files;

  const saved = [];

  for (const file of files) {
    const pathDb = `/uploads/temuan/${file.filename}`;
    const result = await pool.query(
      `INSERT INTO lampiran_temuan (temuan_id, file_path)
       VALUES ($1,$2) RETURNING *`,
      [id, pathDb]
    );
    saved.push(result.rows[0]);
  }

  res.status(201).json({ data: saved });
});

app.get('/api/temuan/:id/lampiran', async (req, res) => {
  const { id } = req.params;
  const result = await pool.query(
    'SELECT * FROM lampiran_temuan WHERE temuan_id = $1',
    [id]
  );
  res.json({ data: result.rows });
});


  // GET semua user
app.get('/api/users', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, nama, username, role FROM users ORDER BY id'
    );
    res.json({ data: result.rows });
  } catch (err) {
    res.status(500).json({ message: 'Gagal mengambil data user' });
  }
});

// POST tambah user baru
app.post('/api/users', async (req, res) => {
  const { nama, username, password, role } = req.body;

  try {
    const passwordHash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (nama, username, password_hash, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, nama, username, role`,
      [nama, username, passwordHash, role]
    );

    res.status(201).json({ data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ message: 'Gagal menambahkan user' });
  }
});


// ============================
// START SERVER
// ============================
app.listen(port, () => {
  console.log(`Backend K3 running on http://localhost:${port}`);
});
