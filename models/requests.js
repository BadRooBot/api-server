const db = require('../database/db');
const moment = require('moment');

class ApiRequest {
  // تسجيل طلب جديد
  static logRequest(requestData, callback) {
    const { ip_address, location, user_agent, endpoint } = requestData;
    const now = moment();
    const request_date = now.format('YYYY-MM-DD');
    const request_time = now.format('HH:mm:ss');
    
    db.run(`
      INSERT INTO api_requests (request_date, request_time, ip_address, location, user_agent, endpoint)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [request_date, request_time, ip_address, location, user_agent, endpoint], function(err) {
      if (err) {
        return callback(err, null);
      }
      callback(null, { id: this.lastID });
    });
  }

  // الحصول على إحصائيات الطلبات حسب التاريخ
  static getStatsByDate(callback) {
    db.all(`
      SELECT request_date, COUNT(*) as count
      FROM api_requests
      GROUP BY request_date
      ORDER BY request_date DESC
      LIMIT 30
    `, (err, rows) => {
      if (err) {
        return callback(err, null);
      }
      callback(null, rows);
    });
  }

  // الحصول على تفاصيل الطلبات ليوم معين
  static getRequestsByDate(date, callback) {
    db.all(`
      SELECT *
      FROM api_requests
      WHERE request_date = ?
      ORDER BY request_time DESC
    `, [date], (err, rows) => {
      if (err) {
        return callback(err, null);
      }
      callback(null, rows);
    });
  }
  
  // الحصول على إحصائيات الطلبات حسب نطاق تاريخي (تجميع يومي)
  static getStatsByDateRange(startDate, endDate, callback) {
    db.all(`
      SELECT request_date as date, COUNT(*) as count
      FROM api_requests
      WHERE request_date BETWEEN ? AND ?
      GROUP BY request_date
      ORDER BY request_date ASC
    `, [startDate, endDate], (err, rows) => {
      if (err) {
        return callback(err, null);
      }
      
      // إضافة الأيام التي لا توجد بها بيانات
      const filledData = fillMissingDates(rows, startDate, endDate, 'day');
      callback(null, filledData);
    });
  }
  
  // الحصول على إحصائيات الطلبات حسب الأسبوع
  static getStatsByWeek(startDate, endDate, callback) {
    db.all(`
      SELECT 
        strftime('%Y-%W', request_date) as week_key,
        strftime('%Y', request_date) || '-W' || strftime('%W', request_date) as date,
        COUNT(*) as count
      FROM api_requests
      WHERE request_date BETWEEN ? AND ?
      GROUP BY week_key
      ORDER BY week_key ASC
    `, [startDate, endDate], (err, rows) => {
      if (err) {
        return callback(err, null);
      }
      
      // إضافة الأسابيع التي لا توجد بها بيانات
      const filledData = fillMissingDates(rows, startDate, endDate, 'week');
      callback(null, filledData);
    });
  }
  
  // الحصول على إحصائيات الطلبات حسب الشهر
  static getStatsByMonth(startDate, endDate, callback) {
    db.all(`
      SELECT 
        strftime('%Y-%m', request_date) as month_key,
        strftime('%Y-%m', request_date) as date,
        COUNT(*) as count
      FROM api_requests
      WHERE request_date BETWEEN ? AND ?
      GROUP BY month_key
      ORDER BY month_key ASC
    `, [startDate, endDate], (err, rows) => {
      if (err) {
        return callback(err, null);
      }
      
      // إضافة الشهور التي لا توجد بها بيانات
      const filledData = fillMissingDates(rows, startDate, endDate, 'month');
      callback(null, filledData);
    });
  }
}

// دالة مساعدة لملء التواريخ المفقودة في البيانات
function fillMissingDates(data, startDate, endDate, interval) {
  const result = [];
  const dataMap = new Map();
  
  // تحويل البيانات إلى خريطة للوصول السريع
  data.forEach(item => {
    dataMap.set(item.date, item.count);
  });
  
  // تحديد بداية ونهاية الفترة
  const start = moment(startDate);
  const end = moment(endDate);
  
  // إنشاء قائمة بجميع التواريخ في النطاق
  let current = start.clone();
  
  while (current.isSameOrBefore(end)) {
    let dateKey;
    
    switch (interval) {
      case 'day':
        dateKey = current.format('YYYY-MM-DD');
        break;
      case 'week':
        dateKey = current.format('YYYY') + '-W' + current.format('WW');
        break;
      case 'month':
        dateKey = current.format('YYYY-MM');
        break;
    }
    
    // إضافة التاريخ مع العدد (0 إذا لم يكن موجودًا)
    result.push({
      date: dateKey,
      count: dataMap.has(dateKey) ? dataMap.get(dateKey) : 0
    });
    
    // الانتقال إلى الفترة التالية
    switch (interval) {
      case 'day':
        current.add(1, 'day');
        break;
      case 'week':
        current.add(1, 'week');
        break;
      case 'month':
        current.add(1, 'month');
        break;
    }
  }
  
  return result;
}

module.exports = ApiRequest;
