const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

// Use absolute path for the database file to avoid CWD issues
const dbPath = path.resolve(__dirname, 'erp.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database', err.message);
  } else {
    console.log(`Connected to the SQLite database at ${dbPath}`);
    initDb();
  }
});

function initDb() {
  db.serialize(() => {
    // 1. Users Table
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      email TEXT UNIQUE,
      password TEXT,
      role TEXT,
      avatar TEXT
    )`);

    // 2. Projects Table
    db.run(`CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      budget REAL,
      spent REAL,
      progress INTEGER,
      status TEXT,
      start_date TEXT,
      end_date TEXT
    )`);

    // 3. Invoices Table
    db.run(`CREATE TABLE IF NOT EXISTS invoices (
      id TEXT PRIMARY KEY,
      vendor TEXT,
      amount REAL,
      due_date TEXT,
      status TEXT,
      project_id INTEGER
    )`);

    // 4. Transactions Table
    db.run(`CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      date TEXT,
      description TEXT,
      amount REAL,
      type TEXT,
      category TEXT
    )`);

    // 5. Audit Logs Table
    db.run(`CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_name TEXT,
      action TEXT,
      timestamp TEXT
    )`);

    // Seed Data if Users table is empty
    db.get("SELECT count(*) as count FROM users", [], (err, row) => {
      if (err) return console.error(err);
      if (row.count === 0) {
        console.log("Seeding database...");
        seedData();
      }
    });
  });
}

function seedData() {
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync('password', salt); // Default password for all

  // Users
  const users = [
    ['Alice Carter', 'alice@buildsmart.com', hash, 'Admin', 'https://picsum.photos/100/100?random=1'],
    ['Bob Finance', 'bob@buildsmart.com', hash, 'Finance Manager', 'https://picsum.photos/100/100?random=2'],
    ['Charlie Site', 'charlie@buildsmart.com', hash, 'Project Manager', 'https://picsum.photos/100/100?random=3']
  ];
  const stmtUser = db.prepare("INSERT INTO users (name, email, password, role, avatar) VALUES (?, ?, ?, ?, ?)");
  users.forEach(u => stmtUser.run(u));
  stmtUser.finalize();

  // Projects
  const projects = [
    ['Skyline Tower Phase 1', 1500000, 1200000, 60, 'Active', '2023-01-15', '2024-06-30'],
    ['Riverfront Bridge', 5000000, 1000000, 25, 'Active', '2023-05-01', '2025-12-01'],
    ['Westside Mall Renovation', 750000, 740000, 85, 'Active', '2023-08-10', '2024-02-28']
  ];
  const stmtProj = db.prepare("INSERT INTO projects (name, budget, spent, progress, status, start_date, end_date) VALUES (?, ?, ?, ?, ?, ?, ?)");
  projects.forEach(p => stmtProj.run(p));
  stmtProj.finalize();

  // Invoices
  const invoices = [
    ['INV-001', 'Steel Supplies Co.', 45000, '2023-10-25', 'Overdue', 1],
    ['INV-002', 'Concrete Mixers Ltd', 12000, '2023-11-05', 'Pending', 2],
    ['INV-003', 'Safety Gear Inc.', 3500, '2023-10-15', 'Paid', 3],
    ['INV-004', 'Heavy Machinery Rentals', 25000, '2023-11-10', 'Pending', 1]
  ];
  const stmtInv = db.prepare("INSERT INTO invoices (id, vendor, amount, due_date, status, project_id) VALUES (?, ?, ?, ?, ?, ?)");
  invoices.forEach(i => stmtInv.run(i));
  stmtInv.finalize();

  // Transactions
  const transactions = [
    ['TRX-991', '2023-10-20', 'Project Payment - Skyline', 50000, 'Credit', 'Revenue'],
    ['TRX-992', '2023-10-21', 'Vendor Payout - Steel', 45000, 'Debit', 'COGS'],
    ['TRX-993', '2023-10-22', 'Office Rent', 2000, 'Debit', 'OpEx']
  ];
  const stmtTrx = db.prepare("INSERT INTO transactions (id, date, description, amount, type, category) VALUES (?, ?, ?, ?, ?, ?)");
  transactions.forEach(t => stmtTrx.run(t));
  stmtTrx.finalize();

  // Logs
  const logs = [
    ['Alice Carter', 'Approved Invoice INV-003', '2023-10-15 14:30'],
    ['Bob Finance', 'Updated Budget for Project 1', '2023-10-16 09:15']
  ];
  const stmtLog = db.prepare("INSERT INTO audit_logs (user_name, action, timestamp) VALUES (?, ?, ?)");
  logs.forEach(l => stmtLog.run(l));
  stmtLog.finalize();
  
  console.log("Database seeded successfully.");
}

module.exports = db;