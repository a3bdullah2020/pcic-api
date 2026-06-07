const express = require('express');
const mysql   = require('mysql2/promise');
const cors    = require('cors');

const app = express();

// ── CORS: السماح للبوابة فقط ──
app.use(cors({
  origin: [
    'https://vocal-lily-83c45f.netlify.app',
    'http://localhost',
    'http://127.0.0.1'
  ],
  methods: ['GET','POST','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization']
}));
app.use(express.json({ limit: '50mb' }));

// ── اتصال MySQL ──
const pool = mysql.createPool({
  host:     process.env.MYSQL_HOST     || 'acela.proxy.rlwy.net',
  port:     process.env.MYSQL_PORT     || 11968,
  user:     process.env.MYSQL_USER     || 'root',
  password: process.env.MYSQL_PASSWORD || 'lPSrGsmGrsdRjROceKhmFpgjrFkOJizE',
  database: process.env.MYSQL_DATABASE || 'railway',
  waitForConnections: true,
  connectionLimit: 10
});

// ── GET /api/db — قراءة البيانات ──
app.get('/api/db', async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT data FROM portal_db WHERE id='main'");
    if (rows.length === 0) return res.json({});
    const data = JSON.parse(rows[0].data || '{}');
    res.json(data);
  } catch (e) {
    console.error('GET error:', e.message);
    res.status(500).json({ error: e.message });
  }
});

// ── POST /api/db — حفظ البيانات ──
app.post('/api/db', async (req, res) => {
  try {
    const dataStr = JSON.stringify(req.body);
    await pool.query(
      "INSERT INTO portal_db (id, data) VALUES ('main', ?) ON DUPLICATE KEY UPDATE data=?, updated_at=NOW()",
      [dataStr, dataStr]
    );
    res.json({ ok: true });
  } catch (e) {
    console.error('POST error:', e.message);
    res.status(500).json({ error: e.message });
  }
});

// ── Health check ──
app.get('/', (req, res) => res.json({ status: 'PCIC API running ✅' }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`PCIC API running on port ${PORT}`));
