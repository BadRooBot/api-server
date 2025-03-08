const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');

// مسارات المصادقة
router.get('/login', authController.showLoginPage);
router.post('/login', authController.login);
router.get('/logout', authController.logout);

// مسار إنشاء مفتاح API (محمي بوسيط المصادقة في app.js)
router.get('/generate-api-key', authController.generateApiKey);

module.exports = router; 