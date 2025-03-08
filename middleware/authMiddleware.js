const crypto = require('crypto');

// قائمة بعناوين IP المسموح لها بالوصول إلى لوحة التحكم
// لم تعد مستخدمة لأننا نطلب تسجيل الدخول دائماً
const ALLOWED_IPS = [
  '127.0.0.1',       // localhost
  '::1',             // localhost IPv6
  '::ffff:127.0.0.1' // localhost mapped IPv4
];

// مفتاح سري للتحقق من صحة الرمز المميز
const SECRET_KEY = process.env.AUTH_SECRET_KEY || 'your-secret-key-change-this-in-production';

// إنشاء رمز مميز للمصادقة
function generateToken() {
  return crypto.createHash('sha256').update(SECRET_KEY + Date.now()).digest('hex');
}

// التحقق من صحة الرمز المميز
function verifyToken(token) {
  // في هذا المثال البسيط، نتحقق فقط من أن الرمز المميز موجود
  // في التطبيق الحقيقي، يجب التحقق من صحة الرمز المميز بشكل أكثر تعقيدًا
  return token && token.length > 0;
}

// وسيط للتحقق من الوصول إلى لوحة التحكم
function authMiddleware(req, res, next) {
  console.log(`[AUTH] Checking auth for path: ${req.path}, method: ${req.method}`);
  
  // التحقق من وجود رمز مميز في الكوكيز
  const authToken = req.cookies && req.cookies.auth_token;
  console.log(`[AUTH] Auth token: ${authToken ? 'Present' : 'Not present'}`);
  
  if (verifyToken(authToken)) {
    console.log(`[AUTH] Valid token, access granted`);
    return next();
  }
  
  console.log(`[AUTH] Authentication failed, redirecting to login`);
  
  // إذا كان الطلب لمسار API، إرجاع خطأ 401
  if (req.path.startsWith('/api')) {
    return res.status(401).json({ error: 'Unauthorized access' });
  }
  
  // إذا لم يكن هناك مصادقة، إعادة توجيه إلى صفحة تسجيل الدخول
  res.redirect('/login');
}

// وسيط للتحقق من المصادقة لمسارات API
function apiAuthMiddleware(req, res, next) {
  console.log(`[API AUTH] Checking auth for path: ${req.path}, method: ${req.method}`);
  
  // السماح بالوصول إلى مسار API المحدد
  if (req.path === '/settings' && req.method === 'GET') {
    console.log(`[API AUTH] Public API endpoint, access granted`);
    return next();
  }
  
  // التحقق من وجود رمز مميز في الكوكيز (للطلبات من لوحة التحكم)
  const authToken = req.cookies && req.cookies.auth_token;
  console.log(`[API AUTH] Auth token from cookies: ${authToken ? 'Present' : 'Not present'}`);
  
  if (verifyToken(authToken)) {
    console.log(`[API AUTH] Valid auth token from cookies, access granted`);
    return next();
  }
  
  // التحقق من وجود رمز مميز في رأس الطلب (للطلبات من تطبيقات خارجية)
  const apiKey = req.headers['x-api-key'];
  console.log(`[API AUTH] API key from headers: ${apiKey ? 'Present' : 'Not present'}`);
  
  if (verifyToken(apiKey)) {
    console.log(`[API AUTH] Valid API key from headers, access granted`);
    return next();
  }
  
  console.log(`[API AUTH] Authentication failed, returning 401`);
  // إذا لم يكن هناك مصادقة، إرجاع خطأ 401
  res.status(401).json({ error: 'Unauthorized access' });
}

module.exports = {
  authMiddleware,
  apiAuthMiddleware,
  generateToken
}; 