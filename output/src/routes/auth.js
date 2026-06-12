'use strict';

const express        = require('express');
const router         = express.Router();
const pool           = require('../db');
const { createError } = require('../middleware/errorHandler');
const { requireSession } = require('../middleware/sessionAuth');

// ── Helper: 取得台北時間字串 (規則 B/C/E) ────────────────
function nowTaipei() {
  return new Date().toISOString().replace('T', ' ').substring(0, 19);
}

// ── Helper: 從 user 物件移除 Password (規則 D) ───────────
function stripPassword(user) {
  if (!user) return user;
  const { Password, ...safe } = user;  // eslint-disable-line no-unused-vars
  return safe;
}

// ══════════════════════════════════════════════════════════
// POST /api/v1/auth/login
// 登入驗證 + 6 步驟資料查詢
// ══════════════════════════════════════════════════════════
router.post('/login', async (req, res, next) => {
  const { Userid, Password } = req.body;

  if (!Userid || !Password) {
    return next(createError(400, '請輸入帳號與密碼'));
  }

  try {
    // ── Step 1: 驗證帳密，取 FromUser ───────────────────
    // 使用 Prepared Statement 防 SQL Injection (規則 E)
    // 正式環境建議使用 bcrypt 比對雜湊密碼，此處以明文示意。
    const [userRows] = await pool.execute(
      `SELECT * FROM bpmuser
       WHERE Userid = ? AND Password = ? AND UserType = 'N'
       LIMIT 1`,
      [Userid, Password]
    );

    if (userRows.length === 0) {
      return next(createError(401, '帳號或密碼錯誤，登入失敗'));
    }

    const FromUser = stripPassword(userRows[0]);

    // ── Step 2: 取 FromBpmusergroup ─────────────────────
    const [groupRows] = await pool.execute(
      `SELECT * FROM bpmusergroup WHERE Groupid = ? LIMIT 1`,
      [FromUser.Groupid]
    );
    const FromBpmusergroup = groupRows[0] || null;

    // ── Step 3: 取 CurrentWorkflow ───────────────────────
    const [wfRows] = await pool.execute(
      `SELECT * FROM workflow
       WHERE FromUsergroupId = ? AND MostUpdated = 'Y'
       LIMIT 1`,
      [FromUser.Groupid]
    );

    // ── 查無 workflow → 導向提示頁 ───────────────────────
    if (wfRows.length === 0) {
      req.session.payload = {
        FromUser,
        FromBpmusergroup,
        CurrentWorkflow:  null,
        ToUser:           null,
        ToBpmusergroup:   null
      };
      req.session.sessionId = req.sessionID;

      return res.json({ success: true, redirect: '/NoWorkflow.html' });
    }

    const CurrentWorkflow = wfRows[0];

    // ── Step 4: 取 ToUser ────────────────────────────────
    const [toUserRows] = await pool.execute(
      `SELECT * FROM bpmuser WHERE Groupid = ? LIMIT 1`,
      [CurrentWorkflow.ToUsergroupId]
    );
    const ToUser = toUserRows.length > 0 ? stripPassword(toUserRows[0]) : null;

    // ── Step 5: 取 ToBpmusergroup ────────────────────────
    let ToBpmusergroup = null;
    if (ToUser) {
      const [toGroupRows] = await pool.execute(
        `SELECT * FROM bpmusergroup WHERE Groupid = ? LIMIT 1`,
        [ToUser.Groupid]
      );
      ToBpmusergroup = toGroupRows[0] || null;
    }

    // ── Step 6: 打包存入 Session ─────────────────────────
    req.session.payload = {
      FromUser,
      FromBpmusergroup,
      CurrentWorkflow,
      ToUser,
      ToBpmusergroup
    };
    req.session.sessionId = req.sessionID;

    return res.json({ success: true, redirect: '/WorkflowResult.html' });

  } catch (err) {
    return next(err);
  }
});

// ══════════════════════════════════════════════════════════
// GET /api/v1/auth/session
// 前端頁面取得 Session 資料 (規則 D)
// ══════════════════════════════════════════════════════════
router.get('/session', requireSession, (req, res) => {
  res.json({
    success:   true,
    sessionId: req.sessionID,
    payload:   req.session.payload
  });
});

module.exports = router;
