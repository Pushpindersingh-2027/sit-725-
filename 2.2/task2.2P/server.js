const express = require('express');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse JSON bodies (for POST)
app.use(express.json());

// Serve static files from public/
app.use(express.static(path.join(__dirname, 'public')));

/**
 * GET /add
 * Example: /add?a=3&b=4
 * Returns JSON: { "a": 3, "b": 4, "result": 7 }
 */
app.get('/add', (req, res) => {
  const a = parseFloat(req.query.a);
  const b = parseFloat(req.query.b);

  if (Number.isNaN(a) || Number.isNaN(b)) {
    return res.status(400).json({ error: 'Query params "a" and "b" must be numbers. Example: /add?a=3&b=4' });
  }

  const result = a + b;
  res.json({ a, b, result });
});

/**
 * POST /add
 * Content-Type: application/json
 * Body: { "a": 10, "b": 15 }
 * Returns: { "a": 10, "b": 15, "result": 25 }
 */
app.post('/add', (req, res) => {
  const { a, b } = req.body;

  const aNum = parseFloat(a);
  const bNum = parseFloat(b);

  if (Number.isNaN(aNum) || Number.isNaN(bNum)) {
    return res.status(400).json({ error: 'Request JSON must contain numeric "a" and "b" fields.' });
  }

  const result = aNum + bNum;
  res.json({ a: aNum, b: bNum, result });
});

// Simple health / info endpoint
app.get('/info', (req, res) => {
  res.json({ service: 'SIT725 Add Service', version: '1.0.0' });
});

// 404 fallback
app.use((req, res) => {
  res.status(404).send('Not found');
});

app.listen(port, () => {
  console.log(`SIT725 add service running on http://localhost:${port}`);
});
