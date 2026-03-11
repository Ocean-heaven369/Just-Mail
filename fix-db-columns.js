const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.db');
const db = new sqlite3.Database(dbPath);

const columns = [
  'is_read  INTEGER DEFAULT 0',
  'is_trash INTEGER DEFAULT 0',
  'is_draft INTEGER DEFAULT 0'
];

db.serialize(() => {
  columns.forEach(colDef => {
    db.run(`ALTER TABLE emails ADD COLUMN ${colDef}`, err => {
      if (err) {
        if (err.message && err.message.includes('duplicate column name')) {
          console.log(`Column already exists: ${colDef.split(' ')[0]}`);
        } else {
          console.error('Error adding column:', err.message);
        }
      } else {
        console.log(`Added column: ${colDef.split(' ')[0]}`);
      }
    });
  });
});

db.close(() => {
  console.log('\nFix finished. You can now delete this file (fix-db-columns.js).');
  console.log('Restart your server (node server.js) and test again.');
});