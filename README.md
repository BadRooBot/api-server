# API Server with Dashboard

سيرفر API مع لوحة تحكم مبني باستخدام Node.js وExpress.

## المميزات

- واجهة API لإدارة الإعدادات
- لوحة تحكم لعرض وتعديل الإعدادات
- تسجيل الطلبات مع معلومات الموقع الجغرافي
- إحصائيات يومية للطلبات
- تخزين البيانات في قاعدة بيانات SQLite

## متطلبات التشغيل

- Node.js (الإصدار 14 أو أعلى)
- npm (الإصدار 6 أو أعلى)

## التثبيت

1. استنساخ المشروع:

``` bash
git clone https://github.com/yourusername/api-server.git
cd api-server
```

2. تثبيت التبعيات:

``` bash
npm install
```

3. تشغيل السيرفر:

``` bash
npm start
```

4. فتح المتصفح والوصول إلى لوحة التحكم:

http://localhost:3000/dashboard

## هيكل API

### الحصول على الإعدادات

GET /api/settings

### تحديث الإعدادات

POST /api/settings
مثال للبيانات:

```json
{
  "openrouter": ["model1", "model2"],
  "ai_model": "gpt-4",
  "gemini_model": "gemini-1.5-flash",
  "huggingface": ["model4", "model5"],
  "app_version": "1.0.0"
}
```

## الترخيص

MIT

