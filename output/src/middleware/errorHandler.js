'use strict';

/**
 * 全域錯誤處理 Middleware (規則 A)
 * 攔截所有未處理錯誤，回傳統一格式。
 */
function errorHandler(err, req, res, _next) {
  const statusCode = err.statusCode || 500;
  const message    = err.message    || '系統發生未預期的錯誤，請稍後再試。';

  console.error(`[ERROR] ${statusCode} - ${message}`, err.stack || '');

  // API 請求 → JSON
  if (req.xhr || req.headers.accept?.includes('application/json')) {
    return res.status(statusCode).json({ success: false, error: message });
  }

  // 一般頁面請求 → HTML 錯誤頁
  res.status(statusCode).send(`
    <!DOCTYPE html>
    <html lang="zh-TW">
    <head>
      <meta charset="UTF-8">
      <title>錯誤 ${statusCode}</title>
      <link rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">
    </head>
    <body class="d-flex align-items-center justify-content-center vh-100 bg-light">
      <div class="card border-danger shadow" style="max-width:480px;width:100%">
        <div class="card-header bg-danger text-white fw-bold">
          ⚠️ 錯誤 ${statusCode}
        </div>
        <div class="card-body">
          <p class="card-text fs-5">${message}</p>
          <a href="/Login.html" class="btn btn-outline-danger mt-2">返回登入頁</a>
        </div>
      </div>
    </body>
    </html>
  `);
}

/**
 * 建立帶有 statusCode 的 Error 物件。
 */
function createError(statusCode, message) {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
}

module.exports = { errorHandler, createError };
