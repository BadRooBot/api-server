const Settings = require('../models/settings');
const ApiRequest = require('../models/requests');

// عرض صفحة الإحصائيات البيانية
exports.showStatistics = (req, res) => {
  Settings.getAll((err, settings) => {
    if (err) {
      return res.status(500).render('error', { message: 'Database error' });
    }
    
    res.render('statistics', { 
      settings: settings || {}
    });
  });
};

// الحصول على إحصائيات الطلبات للرسم البياني
exports.getStatistics = (req, res) => {
  const { startDate, endDate, groupBy } = req.query;
  
  // التحقق من صحة المعلمات
  if (!startDate || !endDate) {
    return res.status(400).json({ success: false, error: 'Missing required parameters' });
  }
  
  // استدعاء الدالة المناسبة بناءً على طريقة التجميع
  switch (groupBy) {
    case 'day':
      ApiRequest.getStatsByDateRange(startDate, endDate, (err, statistics) => {
        if (err) {
          return res.status(500).json({ success: false, error: 'Database error' });
        }
        
        res.json({ success: true, statistics });
      });
      break;
      
    case 'week':
      ApiRequest.getStatsByWeek(startDate, endDate, (err, statistics) => {
        if (err) {
          return res.status(500).json({ success: false, error: 'Database error' });
        }
        
        res.json({ success: true, statistics });
      });
      break;
      
    case 'month':
      ApiRequest.getStatsByMonth(startDate, endDate, (err, statistics) => {
        if (err) {
          return res.status(500).json({ success: false, error: 'Database error' });
        }
        
        res.json({ success: true, statistics });
      });
      break;
      
    default:
      // استخدام التجميع اليومي كقيمة افتراضية
      ApiRequest.getStatsByDateRange(startDate, endDate, (err, statistics) => {
        if (err) {
          return res.status(500).json({ success: false, error: 'Database error' });
        }
        
        res.json({ success: true, statistics });
      });
  }
}; 