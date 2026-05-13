const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;
const DB_FILE = path.join(__dirname, 'db.json');

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));

// Helper to read DB
const readDB = () => {
    try {
        if (!fs.existsSync(DB_FILE)) return {};
        const data = fs.readFileSync(DB_FILE, 'utf8');
        if (!data || data.trim() === "") return {};
        return JSON.parse(data);
    } catch (e) {
        console.error("Error reading DB:", e);
        return {};
    }
};

// Helper to write DB
const writeDB = (data) => {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
};

// Storage Get API
app.get('/api/storage/:key', (req, res) => {
    const { key } = req.params;
    const db = readDB();
    res.json({ value: db[key] || null });
});

// Storage Set API
app.post('/api/storage/:key', (req, res) => {
    const { key } = req.params;
    const { value } = req.body;
    const db = readDB();
    db[key] = value;
    writeDB(db);
    res.json({ success: true });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
