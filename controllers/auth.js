const { generateToken } = require('../middleware/authMiddleware');

// بيانات المستخدم (في التطبيق الحقيقي، يجب تخزين هذه البيانات في قاعدة البيانات)
// يجب تغيير اسم المستخدم وكلمة المرور في بيئة الإنتاج
const ADMIN_USERNAME = process.env.ADMIN_USERNAME ;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ;

// عرض صفحة تسجيل الدخول
exports.showLoginPage = (req, res) => {
  res.render('login', { error: null });
};

// معالجة تسجيل الدخول
exports.login = (req, res) => {
  const { username, password } = req.body;
  
  // التحقق من صحة بيانات تسجيل الدخول
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    // إنشاء رمز مميز للمصادقة
    const token = generateToken();
    
    // تخزين الرمز المميز في الكوكيز
    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000 // صلاحية لمدة يوم واحد
    });
    
    // إعادة توجيه إلى لوحة التحكم
    res.redirect('/dashboard');
  } else {
    // إذا كانت بيانات تسجيل الدخول غير صحيحة، عرض رسالة خطأ
    res.render('login', { error: 'اسم المستخدم أو كلمة المرور غير صحيحة' });
  }
};

// تسجيل الخروج
exports.logout = (req, res) => {
  // حذف الرمز المميز من الكوكيز
  res.clearCookie('auth_token');
  
  // إعادة توجيه إلى صفحة تسجيل الدخول
  res.redirect('/login');
};

// إنشاء مفتاح API
exports.generateApiKey = (req, res) => {
  // إنشاء مفتاح API جديد
  const apiKey = generateToken();
  
  // في التطبيق الحقيقي، يجب تخزين مفتاح API في قاعدة البيانات
  // وربطه بالمستخدم أو التطبيق المحدد
  
  res.json({ success: true, apiKey });
}; 