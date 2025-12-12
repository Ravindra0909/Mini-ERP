const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const path = require('path');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000; // Allow cloud provider to set PORT
const SECRET_KEY = process.env.JWT_SECRET || 'your_jwt_secret_key_here';

app.use(cors());
app.use(bodyParser.json());

// --- Middleware ---
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// --- Auth Routes ---
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  
  db.get("SELECT * FROM users WHERE email = ?", [email], (err, user) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (!user) return res.status(401).json({ error: "User not found" });

    const validPassword = bcrypt.compareSync(password, user.password);
    if (!validPassword) return res.status(401).json({ error: "Invalid password" });

    // Create Token
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, SECRET_KEY, { expiresIn: '1h' });
    
    // Return user info (excluding password)
    const { password: _, ...userInfo } = user;
    res.json({ token, user: userInfo });
  });
});

// --- Data Routes ---

// 1. Projects
app.get('/api/projects', authenticateToken, (req, res) => {
  db.all("SELECT * FROM projects", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });

    const projectsWithRisk = rows.map(project => {
      let score = 0;
      const spentPct = (project.spent / project.budget) * 100;
      
      if (spentPct > project.progress + 15) score += 50;
      else if (spentPct > project.progress + 5) score += 20;

      if (spentPct > 90) score += 30;

      let level = 'Low';
      if (score > 60) level = 'Critical';
      else if (score > 40) level = 'High';
      else if (score > 20) level = 'Medium';

      return { ...project, riskScore: score, riskLevel: level };
    });

    res.json(projectsWithRisk);
  });
});

// 2. Invoices
app.get('/api/finance/invoices', authenticateToken, (req, res) => {
  db.all("SELECT * FROM invoices", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/finance/invoices', authenticateToken, (req, res) => {
  const { vendor, amount, dueDate, projectId } = req.body;
  const id = 'INV-' + Math.floor(1000 + Math.random() * 9000);
  const status = 'Pending';
  
  const sql = "INSERT INTO invoices (id, vendor, amount, due_date, status, project_id) VALUES (?, ?, ?, ?, ?, ?)";
  const params = [id, vendor, amount, dueDate, status, projectId];
  
  db.run(sql, params, function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id, vendor, amount, dueDate, status, projectId });
  });
});

// 3. Transactions
app.get('/api/finance/transactions', authenticateToken, (req, res) => {
  db.all("SELECT * FROM transactions", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// 4. Users
app.get('/api/admin/users', authenticateToken, (req, res) => {
  db.all("SELECT id, name, email, role, avatar FROM users", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// 5. Logs
app.get('/api/admin/logs', authenticateToken, (req, res) => {
  db.all("SELECT id, user_name as user, action, timestamp FROM audit_logs ORDER BY id DESC", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// 6. Cash Flow
app.get('/api/dashboard/cashflow', authenticateToken, (req, res) => {
  const forecast = [
    { month: 'May', actual: 40000, projected: 42000 },
    { month: 'Jun', actual: 35000, projected: 38000 },
    { month: 'Jul', actual: 50000, projected: 48000 },
    { month: 'Aug', actual: 48000, projected: 51000 },
    { month: 'Sep', actual: 60000, projected: 59000 },
    { month: 'Oct', actual: 55000, projected: 58000 },
    { month: 'Nov (Forecast)', actual: null, projected: 62000 },
  ];
  res.json(forecast);
});

// --- Serving Frontend (Production) ---
// Serve static files from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// Handle React Routing, return all requests to React app
// We use a middleware with no path to match all remaining requests.
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  
});