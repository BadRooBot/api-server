const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');
const db = require('./database/db');
const { authMiddleware } = require('./middleware/authMiddleware');

// إنشاء تطبيق Express
const app = express();
const PORT = process.env.PORT || 3000;

// الوسائط البرمجية الأساسية
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// إعداد محرك العرض
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// تضمين المسارات
const apiRoutes = require('./routes/api');
const dashboardRoutes = require('./routes/dashboard');
const authRoutes = require('./routes/auth');
const authController = require('./controllers/auth');

// الملفات الثابتة - متاحة للجميع
app.use('/css', express.static(path.join(__dirname, 'public/css')));
app.use('/js', express.static(path.join(__dirname, 'public/js')));
app.use('/images', express.static(path.join(__dirname, 'public/images')));

// مسارات المصادقة - متاحة للجميع
app.get('/login', authController.showLoginPage);
app.post('/login', authController.login);
app.get('/logout', authController.logout);

// مسار API العام
app.get('/api/settings', (req, res, next) => {
  console.log('[APP] Public API endpoint accessed: /api/settings');
  apiRoutes(req, res, next);
});

// تطبيق وسيط المصادقة على جميع المسارات الأخرى
app.use((req, res, next) => {
  // استثناء الملفات الثابتة والمسارات العامة
  if (req.path === '/login' || 
      req.path === '/logout' || 
      req.path.startsWith('/css/') || 
      req.path.startsWith('/js/') || 
      req.path.startsWith('/images/') || 
      req.path.match(/\.(css|js|ico|png|jpg|jpeg|gif|svg)$/)) {
    console.log(`[APP] Skipping auth for public path: ${req.path}`);
    return next();
  }
  
  console.log(`[APP] Applying auth middleware for protected path: ${req.path}`);
  // تطبيق المصادقة على باقي المسارات
  authMiddleware(req, res, next);
});

// مسارات API ولوحة التحكم (محمية بوسيط المصادقة)
app.use('/api', apiRoutes);
app.use('/dashboard', dashboardRoutes);
app.get('/generate-api-key', authController.generateApiKey);

// الصفحة الرئيسية
app.get('/', (req, res) => {
  res.redirect('/dashboard');
});

// معالجة الطلبات غير الموجودة
app.use((req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'Endpoint not found' });
  }
  res.status(404).render('error', { message: 'الصفحة غير موجودة' });
});

// معالجة الأخطاء
app.use((err, req, res, next) => {
  console.error(err.stack);
  if (req.path.startsWith('/api')) {
    return res.status(500).json({ error: 'Internal server error' });
  }
  res.status(500).render('error', { message: 'حدث خطأ في الخادم' });
});

// تشغيل السيرفر
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Dashboard available at http://localhost:${PORT}/dashboard`);
  console.log(`Login page available at http://localhost:${PORT}/login`);
});
