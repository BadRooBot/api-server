const db = require('../database/db');

class Settings {
  // الحصول على جميع الإعدادات
  static getAll(callback) {
    db.get("SELECT * FROM settings WHERE id = 1", (err, row) => {
      if (err) {
        return callback(err, null);
      }
      
      if (row) {
        try {
          // تحويل النصوص JSON إلى كائنات JavaScript
          row.openrouter = JSON.parse(row.openrouter || '[]');
          row.huggingface = JSON.parse(row.huggingface || '[]');
        } catch (e) {
          console.error('Error parsing JSON:', e);
          row.openrouter = [];
          row.huggingface = [];
        }
        
        // التأكد من أن log_requests هو قيمة منطقية
        row.log_requests = row.log_requests === undefined ? true : !!row.log_requests;
      } else {
        // إذا لم يتم العثور على إعدادات، إنشاء كائن افتراضي
        row = {
          openrouter: [],
          huggingface: [],
          ai_model: '',
          app_version: '1.0.0',
          log_requests: true
        };
      }
      
      callback(null, row);
    });
  }

  // تحديث الإعدادات
  static update(settings, callback) {
    const { openrouter, ai_model, huggingface, app_version, log_requests } = settings;
    
    // تحويل المصفوفات إلى نصوص JSON
    let openrouterJson, huggingfaceJson;
    
    try {
      openrouterJson = JSON.stringify(openrouter || []);
      huggingfaceJson = JSON.stringify(huggingface || []);
    } catch (e) {
      console.error('Error stringifying JSON:', e);
      openrouterJson = '[]';
      huggingfaceJson = '[]';
    }
    
    // التأكد من أن log_requests هو قيمة منطقية
    const shouldLogRequests = log_requests === undefined ? true : !!log_requests;
    
    db.run(`
      UPDATE settings 
      SET openrouter = ?, ai_model = ?, huggingface = ?, app_version = ?, log_requests = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = 1
    `, [openrouterJson, ai_model, huggingfaceJson, app_version, shouldLogRequests ? 1 : 0], function(err) {
      if (err) {
        return callback(err, null);
      }
      callback(null, { changes: this.changes });
    });
  }
  
  // الحصول على إعداد تسجيل الطلبات
  static getLogRequestsSetting(callback) {
    db.get("SELECT log_requests FROM settings WHERE id = 1", (err, row) => {
      if (err) {
        return callback(err, null);
      }
      
      // إذا لم يتم العثور على الإعداد، افترض أنه يجب تسجيل الطلبات
      const shouldLogRequests = row ? !!row.log_requests : true;
      
      callback(null, shouldLogRequests);
    });
  }
}

module.exports = Settings;