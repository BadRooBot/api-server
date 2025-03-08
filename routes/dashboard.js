const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard');
const statisticsController = require('../controllers/statistics');

// مسارات لوحة التحكم
router.get('/', dashboardController.showDashboard);
router.get('/settings', dashboardController.showSettings);
router.get('/requests/:date', dashboardController.showRequestDetails);
router.get('/statistics', statisticsController.showStatistics);

module.exports = router;