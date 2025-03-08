const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// التأكد من وجود مجلد قاعدة البيانات
const dbDir = path.join(__dirname, 'data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir);
}

// إنشاء اتصال قاعدة البيانات
const dbPath = path.join(dbDir, 'app_data.db');
const db = new sqlite3.Database(dbPath);

// إنشاء الجداول إذا لم تكن موجودة
db.serialize(() => {
  // جدول الإعدادات
  db.run(`
    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY,
      openrouter TEXT,
      ai_model TEXT,
      huggingface TEXT,
      app_version TEXT,
      log_requests BOOLEAN DEFAULT 1,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // جدول طلبات API
  db.run(`
    CREATE TABLE IF NOT EXISTS api_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      request_date DATE,
      request_time TIME,
      ip_address TEXT,
      location TEXT,
      user_agent TEXT,
      endpoint TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // إدخال بيانات افتراضية للإعدادات إذا كان الجدول فارغًا
  db.get("SELECT COUNT(*) as count FROM settings", (err, row) => {
    if (err) {
      console.error(err);
      return;
    }
    
    if (row.count === 0) {
      db.run(`
        INSERT INTO settings (openrouter, ai_model, huggingface, app_version, log_requests)
        VALUES (?, ?, ?, ?, ?)
      `, [
        JSON.stringify([]),
        '',
        JSON.stringify([]),
        '1.0.0',
        1
      ]);
    }
  });
  
  // التحقق من وجود عمود log_requests وإضافته إذا لم يكن موجودًا
  db.all("PRAGMA table_info(settings)", (err, rows) => {
    if (err) {
      console.error(err);
      return;
    }
    
    // التحقق من أن rows هو مصفوفة
    if (Array.isArray(rows)) {
      const hasLogRequests = rows.some(row => row.name === 'log_requests');
      
      if (!hasLogRequests) {
        db.run("ALTER TABLE settings ADD COLUMN log_requests BOOLEAN DEFAULT 1", (err) => {
          if (err) {
            console.error('Error adding log_requests column:', err);
          }
        });
      }
    } else {
      console.error('Expected rows to be an array, but got:', typeof rows);
      // محاولة إضافة العمود على أي حال
      db.run("ALTER TABLE settings ADD COLUMN log_requests BOOLEAN DEFAULT 1", (err) => {
        if (err && !err.message.includes('duplicate column')) {
          console.error('Error adding log_requests column:', err);
        }
      });
    }
  });
});

module.exports = db;