const ApiRequest = require('../models/requests');
const Settings = require('../models/settings');
const geoip = require('geoip-lite');

function requestLogger(req, res, next) {
  // تجاهل الطلبات التي تأتي من لوحة التحكم
  if (req.originalUrl.startsWith('/dashboard') || req.originalUrl === '/') {
    return next();
  }
  
  // تجاهل طلبات الموارد الثابتة (CSS, JS, الصور)
  if (req.originalUrl.match(/\.(css|js|ico|png|jpg|jpeg|gif|svg)$/)) {
    return next();
  }
  
  // التحقق من إعداد تسجيل الطلبات
  Settings.getLogRequestsSetting((err, shouldLogRequests) => {
    // في حالة حدوث خطأ، نستمر بدون تسجيل الطلب
    if (err) {
      console.error('Error checking log requests setting:', err);
      return next();
    }
    
    // إذا كان تسجيل الطلبات معطلاً، نستمر بدون تسجيل
    if (!shouldLogRequests) {
      return next();
    }
    
    try {
      // الحصول على عنوان IP
      const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || '0.0.0.0';
      
      // محاولة الحصول على الموقع الجغرافي
      let location = 'Unknown';
      try {
        const geo = geoip.lookup(ip);
        if (geo && geo.city && geo.country) {
          location = `${geo.city}, ${geo.country}`;
        }
      } catch (geoError) {
        console.error('Error getting geolocation:', geoError);
      }
      
      // تسجيل الطلب
      ApiRequest.logRequest({
        ip_address: ip,
        location: location,
        user_agent: req.headers['user-agent'] || 'Unknown',
        endpoint: req.originalUrl
      }, (logErr) => {
        if (logErr) {
          console.error('Error logging request:', logErr);
        }
      });
    } catch (e) {
      console.error('Unexpected error in request logger:', e);
    }
    
    // استمر بغض النظر عن نجاح أو فشل تسجيل الطلب
    next();
  });
}

module.exports = requestLogger;