const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const path = require("path");
const bcrypt = require("bcrypt");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const dbPath = path.resolve(__dirname, "database.db");
console.log("📂 Using DB at:", dbPath);

const db = new sqlite3.Database(dbPath);

const SALT_ROUNDS = 12;

db.serialize(() => {
  // ─── Tables ──────────────────────────────────────────────────
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS emails (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sender TEXT NOT NULL,
      receiver TEXT NOT NULL,
      subject TEXT,
      message TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      is_read INTEGER DEFAULT 0,
      is_trash INTEGER DEFAULT 0,
      is_draft INTEGER DEFAULT 0
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS contacts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      owner TEXT NOT NULL,
      contactEmail TEXT NOT NULL,
      UNIQUE(owner, contactEmail)
    )
  `);

  // ─── Indexes ─────────────────────────────────────────────────
  db.run("CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)");
  db.run("CREATE INDEX IF NOT EXISTS idx_emails_receiver ON emails(receiver)");
  db.run("CREATE INDEX IF NOT EXISTS idx_emails_sender ON emails(sender)");
  db.run("CREATE INDEX IF NOT EXISTS idx_emails_is_trash ON emails(is_trash)");
  db.run("CREATE INDEX IF NOT EXISTS idx_emails_is_draft ON emails(is_draft)");
  db.run("CREATE INDEX IF NOT EXISTS idx_contacts_owner ON contacts(owner)");

  // ─── Safe column migrations ──────────────────────────────────
  db.all("PRAGMA table_info(emails)", (err, rows) => {
    if (err) {
      console.error("Cannot inspect emails table:", err);
      return;
    }

    const cols = rows.map(r => r.name);

    const migrations = [
      { name: 'is_read',  sql: 'INTEGER DEFAULT 0' },
      { name: 'is_trash', sql: 'INTEGER DEFAULT 0' },
      { name: 'is_draft', sql: 'INTEGER DEFAULT 0' }
    ];

    migrations.forEach(m => {
      if (!cols.includes(m.name)) {
        console.log(`→ Adding column ${m.name} to emails`);
        db.run(`ALTER TABLE emails ADD COLUMN ${m.name} ${m.sql}`, err => {
          if (err) {
            console.error(`Failed adding ${m.name}:`, err.message);
          } else {
            console.log(`Added ${m.name} successfully`);
          }
        });
      }
    });
  });
});

// ─── Promise wrappers ────────────────────────────────────────
function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

// ─── Routes ──────────────────────────────────────────────────

app.post("/register", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: "Email and password required" });

  const lowerEmail = email.toLowerCase();

  try {
    const hashed = await bcrypt.hash(password, SALT_ROUNDS);

    await run("INSERT INTO users (email, password) VALUES (?, ?)", [lowerEmail, hashed]);

    // Default contacts
    const defaultContacts = [
      "support@justmail.com",
      "team@justmail.com",
      "friend1@example.com",
      "boss@company.com",
      "family@gmail.com",
      "newsletter@technews.com"
    ];

    for (const contact of defaultContacts) {
      await run("INSERT OR IGNORE INTO contacts (owner, contactEmail) VALUES (?, ?)",
        [lowerEmail, contact]);
    }

    // Default inbox mails
    const defaultInbox = [
      { sender: "welcome@justmail.com", subject: "Welcome to Just Mail!", message: "Hi!\nEnjoy your new account.", timestamp: new Date().toISOString() },
      { sender: "team@justmail.com", subject: "Quick Start Guide", message: "Tips for using Just Mail.", timestamp: new Date(Date.now() - 7200000).toISOString() },
      { sender: "newsletter@technews.com", subject: "Weekly Tech Digest", message: "Latest news...", timestamp: new Date(Date.now() - 86400000).toISOString() },
    ];

    for (const m of defaultInbox) {
      await run(
        "INSERT INTO emails (sender, receiver, subject, message, timestamp, is_read, is_trash, is_draft) VALUES (?,?,?,?,?,?,?,?)",
        [m.sender, lowerEmail, m.subject, m.message, m.timestamp, 0, 0, 0]
      );
    }

    // Default sent mails
    const defaultSent = [
      { receiver: "friend1@example.com", subject: "Hey there!", message: "How are you?", timestamp: new Date(Date.now() - 3600000).toISOString() },
      { receiver: "boss@company.com", subject: "Report attached", message: "Please review.", timestamp: new Date(Date.now() - 14400000).toISOString() },
    ];

    for (const m of defaultSent) {
      await run(
        "INSERT INTO emails (sender, receiver, subject, message, timestamp, is_read, is_trash, is_draft) VALUES (?,?,?,?,?,?,?,?)",
        [lowerEmail, m.receiver, m.subject, m.message, m.timestamp, 1, 0, 0]
      );
    }

    res.json({ message: "Account created successfully" });
  } catch (err) {
    if (err.message?.includes("UNIQUE constraint failed")) {
      return res.status(409).json({ message: "Email already registered" });
    }
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: "Email and password required" });

  try {
    const user = await get("SELECT * FROM users WHERE email = ?", [email.toLowerCase()]);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    res.json({ email: user.email });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ─── Core email routes ───────────────────────────────────────

app.post("/send", async (req, res) => {
  const { sender, receiver, subject, message } = req.body;
  if (!sender || !receiver || !message) return res.status(400).json({ success: false });

  try {
    await run(
      "INSERT INTO emails (sender, receiver, subject, message, is_draft) VALUES (?, ?, ?, ?, 0)",
      [sender, receiver, subject || "(No subject)", message]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

app.get("/inbox/:email", async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;

  try {
    const rows = await all(
      `SELECT * FROM emails 
       WHERE receiver = ? AND is_trash = 0 AND is_draft = 0 
       ORDER BY timestamp DESC LIMIT ? OFFSET ?`,
      [req.params.email.toLowerCase(), Number(limit), Number(offset)]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json([]);
  }
});

app.get("/sent/:email", async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;

  try {
    const rows = await all(
      `SELECT * FROM emails 
       WHERE sender = ? AND is_trash = 0 AND is_draft = 0 
       ORDER BY timestamp DESC LIMIT ? OFFSET ?`,
      [req.params.email.toLowerCase(), Number(limit), Number(offset)]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json([]);
  }
});

app.patch("/emails/:id/read", async (req, res) => {
  const { id } = req.params;
  const { receiver } = req.body;

  try {
    const result = await run(
      "UPDATE emails SET is_read = 1 WHERE id = ? AND receiver = ?",
      [id, receiver.toLowerCase()]
    );
    res.json({ success: result.changes > 0 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

app.get("/unread/:email", async (req, res) => {
  try {
    const row = await get(
      "SELECT COUNT(*) as count FROM emails WHERE receiver = ? AND is_read = 0 AND is_trash = 0 AND is_draft = 0",
      [req.params.email.toLowerCase()]
    );
    res.json({ unread: row.count });
  } catch (err) {
    console.error(err);
    res.json({ unread: 0 });
  }
});

// ─── Contacts routes ─────────────────────────────────────────

app.get("/contacts/:email", async (req, res) => {
  try {
    const rows = await all(
      "SELECT contactEmail FROM contacts WHERE owner = ? ORDER BY contactEmail",
      [req.params.email.toLowerCase()]
    );
    res.json(rows.map(r => r.contactEmail));
  } catch (err) {
    console.error(err);
    res.status(500).json([]);
  }
});

app.post("/contacts", async (req, res) => {
  const { owner, contactEmail } = req.body;
  if (!owner || !contactEmail) return res.status(400).json({ success: false });

  try {
    await run(
      "INSERT OR IGNORE INTO contacts (owner, contactEmail) VALUES (?, ?)",
      [owner.toLowerCase(), contactEmail.toLowerCase()]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

app.delete("/contacts/:contactEmail", async (req, res) => {
  const owner = req.query.owner;
  const { contactEmail } = req.params;

  if (!owner || !contactEmail) return res.status(400).json({ success: false });

  try {
    await run(
      "DELETE FROM contacts WHERE owner = ? AND contactEmail = ?",
      [owner.toLowerCase(), contactEmail.toLowerCase()]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

// ─── Drafts & Trash ──────────────────────────────────────────

app.post("/drafts", async (req, res) => {
  const { sender, subject = "", message = "" } = req.body;
  if (!sender) return res.status(400).json({ success: false });

  try {
    await run(
      "INSERT INTO emails (sender, receiver, subject, message, is_draft) VALUES (?, ?, ?, ?, 1)",
      [sender, sender, subject, message]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

app.get("/drafts/:email", async (req, res) => {
  const { page = 1, limit = 12 } = req.query;
  const offset = (page - 1) * limit;

  try {
    const rows = await all(
      "SELECT * FROM emails WHERE sender = ? AND is_draft = 1 ORDER BY timestamp DESC LIMIT ? OFFSET ?",
      [req.params.email.toLowerCase(), limit, offset]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json([]);
  }
});

app.get("/trash/:email", async (req, res) => {
  const { page = 1, limit = 12 } = req.query;
  const offset = (page - 1) * limit;

  try {
    const rows = await all(
      "SELECT * FROM emails WHERE receiver = ? AND is_trash = 1 ORDER BY timestamp DESC LIMIT ? OFFSET ?",
      [req.params.email.toLowerCase(), limit, offset]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json([]);
  }
});

app.patch("/emails/:id/trash", async (req, res) => {
  const { id } = req.params;
  const { owner } = req.body;

  try {
    await run(
      "UPDATE emails SET is_trash = 1, is_draft = 0 WHERE id = ? AND (receiver = ? OR sender = ?)",
      [id, owner.toLowerCase(), owner.toLowerCase()]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

app.patch("/emails/:id/restore", async (req, res) => {
  const { id } = req.params;
  const { owner } = req.body;

  try {
    await run(
      "UPDATE emails SET is_trash = 0 WHERE id = ? AND (receiver = ? OR sender = ?)",
      [id, owner.toLowerCase(), owner.toLowerCase()]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

app.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});