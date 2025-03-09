const Settings = require('../models/settings');

// الحصول على الإعدادات
exports.getSettings = (req, res) => {
  Settings.getAll((err, settings) => {
    if (err) {
      console.error('Error getting settings:', err);
      return res.status(500).json({ error: 'Database error', details: err.message });
    }
    
    if (!settings) {
      return res.status(404).json({ error: 'Settings not found' });
    }
    
    res.json(settings);
  });
};

// تحديث الإعدادات
exports.updateSettings = (req, res) => {
  const { openrouter, ai_model, gemini_model,huggingface, app_version, log_requests } = req.body;
  
  // التحقق من صحة البيانات
  if (!Array.isArray(openrouter) || !Array.isArray(huggingface)) {
    return res.status(400).json({ error: 'Invalid data format: openrouter and huggingface must be arrays' });
  }
  
  if (!ai_model) {
    return res.status(400).json({ error: 'Invalid data format: ai_model is required' });
  }
  
  if (!app_version) {
    return res.status(400).json({ error: 'Invalid data format: app_version is required' });
  }
  
  // تحديث الإعدادات
  Settings.update({ 
    openrouter, 
    ai_model, 
    gemini_model,
    huggingface, 
    app_version, 
    log_requests: log_requests === undefined ? true : log_requests 
  }, (err, result) => {
    if (err) {
      console.error('Error updating settings:', err);
      return res.status(500).json({ error: 'Database error', details: err.message });
    }
    
    res.json({ success: true, message: 'Settings updated successfully' });
  });
};