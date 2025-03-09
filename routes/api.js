const express = require('express');
const router = express.Router();
const apiController = require('../controllers/api');
const statisticsController = require('../controllers/statistics');
const requestLogger = require('../middleware/requestLogger');
const { apiAuthMiddleware } = require('../middleware/authMiddleware');

// تطبيق وسيط تسجيل الطلبات على جميع مسارات API
// باستثناء الطلبات التي تأتي من لوحة التحكم (تم التعامل معها في وسيط requestLogger)
router.use(requestLogger);

// مسار الإعدادات العام (متاح للجميع)
router.get('/settings', apiController.getSettings);

// تطبيق وسيط المصادقة على باقي مسارات API
router.use((req, res, next) => {
  console.log(req.path);
  // استثناء مسار GET /settings
  if (req.path === '/api/settings' && req.method === 'GET') {
    console.log('[API ROUTER] Skipping auth for public API endpoint');
    return next();
  }
  
  console.log('[API ROUTER] Applying auth middleware for protected API endpoint');
  apiAuthMiddleware(req, res, next);
});

// مسارات الإعدادات المحمية
router.post('/settings', apiController.updateSettings);

// مسارات الإحصائيات المحمية
router.get('/statistics', statisticsController.getStatistics);

module.exports = router;