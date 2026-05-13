const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');

const app = express();
// FORCE PORT 5000 to match Docker and Frontend Storage expectations
const PORT = 5000; 
const DB_FILE = path.join(__dirname, 'db.json');

app.use(helmet({ contentSecurityPolicy: false }));
app.use(compression());
app.use(morgan('dev'));
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Helper: Read DB
const readDB = () => {
  try {
    if (!fs.existsSync(DB_FILE)) return {};
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data || '{}');
  } catch (err) {
    console.error('DB Read Error:', err);
    return {};
  }
};

// Helper: Write DB
const writeDB = (data) => {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
    return true;
  } catch (err) {
    console.error('DB Write Error:', err);
    return false;
  }
};

app.get('/health', (req, res) => res.status(200).json({ status: 'UP', port: PORT }));

app.get('/api/storage/:key', (req, res) => {
  const db = readDB();
  const value = db[req.params.key] || null;
  res.json({ value });
});

app.post('/api/storage', (req, res) => {
  const { key, value } = req.body;
  if (!key) return res.status(400).json({ error: 'Key required' });
  
  const db = readDB();
  db[key] = value;
  
  if (writeDB(db)) {
    res.json({ success: true });
  } else {
    res.status(500).json({ error: 'Write failed' });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n\x1b[32m%s\x1b[0m`, `🚀 MIS BACKEND ACTIVE`);
  console.log(`📡 URL: http://localhost:${PORT}`);
  console.log(`📂 DB:  ${DB_FILE}\n`);
});
