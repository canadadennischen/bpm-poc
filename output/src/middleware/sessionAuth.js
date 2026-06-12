'use strict';

/**
 * Session 保護 Middleware (規則 D)
 * 除登入頁外，所有 API 均需要有效 Session。
 * 無效時回傳 HTTP 401，前端收到後自動導回 Login.html。
 */
function requireSession(req, res, next) {
  if (req.session && req.session.payload) {
    return next();
  }
  return res.status(401).json({ success: false, error: 'Unauthorized. Please login.' });
}

module.exports = { requireSession };
