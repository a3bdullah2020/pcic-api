const express = require('express');
const mysql   = require('mysql2/promise');
const cors    = require('cors');

const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));

const pool = mysql.createPool({
  host:     process.env.MYSQL_HOST     || 'acela.proxy.rlwy.net',
  port:     parseInt(process.env.MYSQL_PORT || '11968'),
  user:     process.env.MYSQL_USER     || 'root',
  password: process.env.MYSQL_PASSWORD || 'lPSrGsmGrsdRjROceKhmFpgjrFkOJizE',
  database: process.env.MYSQL_DATABASE || 'railway',
  waitForConnections: true,
  connectionLimit: 10
});

app.get('/api/db', async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT data FROM portal_db WHERE id='main'");
    if (rows.length === 0) return res.json({});
    res.json(JSON.parse(rows[0].data || '{}'));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/db', async (req, res) => {
  try {
    const dataStr = JSON.stringify(req.body);
    await pool.query(
      "INSERT INTO portal_db (id, data) VALUES ('main', ?) ON DUPLICATE KEY UPDATE data=?, updated_at=NOW()",
      [dataStr, dataStr]
    );
    res.json({ ok: true });
  } ca
