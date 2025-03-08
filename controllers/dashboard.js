const Settings = require('../models/settings');
const ApiRequest = require('../models/requests');

// عرض لوحة التحكم الرئيسية
exports.showDashboard = (req, res) => {
  Settings.getAll((err, settings) => {
    if (err) {
      return res.status(500).render('error', { message: 'Database error' });
    }
    
    ApiRequest.getStatsByDate((err, stats) => {
      if (err) {
        return res.status(500).render('error', { message: 'Database error' });
      }
      
      res.render('dashboard', { 
        settings: settings || {}, 
        stats: stats || []
      });
    });
  });
};

// عرض صفحة الإعدادات
exports.showSettings = (req, res) => {
  Settings.getAll((err, settings) => {
    if (err) {
      return res.status(500).render('error', { message: 'Database error' });
    }
    
    res.render('settings', { settings: settings || {} });
  });
};

// عرض تفاصيل الطلبات ليوم معين
exports.showRequestDetails = (req, res) => {
  const date = req.params.date;
  
  ApiRequest.getRequestsByDate(date, (err, requests) => {
    if (err) {
      return res.status(500).render('error', { message: 'Database error' });
    }
    
    res.render('requests', { 
      date: date,
      requests: requests || []
    });
  });
};