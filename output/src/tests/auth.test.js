'use strict';

/**
 * BPM — 登入相關整合測試
 * 框架: Jest + Supertest
 *
 * 前置條件：
 *   - 測試用 DB 環境變數（可指向 docker-compose 啟動的 MySQL）
 *   - 測試資料已由 BPM.sql 初始化
 *
 * 執行方式：
 *   npm test
 *   或搭配測試 DB：
 *   DB_HOST=localhost DB_PORT=3306 DB_USER=bpmuser DB_PASSWORD=bpmpass DB_NAME=bpmdb npm test
 */

// ── 載入測試用環境變數 ─────────────────────────────────────
process.env.TZ              = 'Asia/Taipei';
process.env.DB_HOST         = process.env.DB_HOST     || 'localhost';
process.env.DB_PORT         = process.env.DB_PORT     || '3306';
process.env.DB_USER         = process.env.DB_USER     || 'bpmuser';
process.env.DB_PASSWORD     = process.env.DB_PASSWORD || 'bpmpass';
process.env.DB_NAME         = process.env.DB_NAME     || 'bpmdb';
process.env.SESSION_SECRET  = 'test_secret';

const request = require('supertest');
const app     = require('../server');
const pool    = require('../db');

afterAll(async () => {
  // 關閉連線池，讓 Jest 正常退出
  await pool.end();
});

// ══════════════════════════════════════════════════════════
// 1.1.1 — 登入成功 (M00006 / Employee 群組，有對應 workflow)
// ══════════════════════════════════════════════════════════
describe('1.1.1 — 登入成功', () => {
  it('應回傳 success:true 並包含 redirect 路徑', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ Userid: 'M00006', Password: '1' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.redirect).toBeDefined();
    // Employee → Manager → /WorkflowResult.html
    expect(res.body.redirect).toBe('/WorkflowResult.html');
  });

  it('回應中不得包含 Password 欄位 (規則 D)', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ Userid: 'M00006', Password: '1' });

    expect(res.status).toBe(200);
    expect(JSON.stringify(res.body)).not.toMatch(/password/i);
  });
});

// ══════════════════════════════════════════════════════════
// 1.1.2 — 登入失敗（帳密錯誤）
// ══════════════════════════════════════════════════════════
describe('1.1.2 — 登入失敗（帳密錯誤）', () => {
  it('密碼錯誤應回傳 401', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ Userid: 'M00006', Password: 'wrong_password' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBeUndefined();
    expect(res.body.error).toBeDefined();
  });

  it('帳號不存在應回傳 401', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ Userid: 'NOBODY', Password: '1' });

    expect(res.status).toBe(401);
    expect(res.body.error).toBeDefined();
  });

  it('系統帳號 (UserType=S) 不得登入', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ Userid: 'TOCaller', Password: '1' });

    expect(res.status).toBe(401);
  });

  it('空白帳密應回傳 400', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ Userid: '', Password: '' });

    expect(res.status).toBe(400);
  });
});

// ══════════════════════════════════════════════════════════
// 1.1.3 — 登入成功但無對應流程 (M00007 / Member 群組)
// ══════════════════════════════════════════════════════════
describe('1.1.3 — 登入成功但無對應流程 (M00007)', () => {
  it('應回傳 success:true 且 redirect 指向 NoWorkflow.html', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ Userid: 'M00007', Password: '1' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.redirect).toBe('/NoWorkflow.html');
  });
});

// ══════════════════════════════════════════════════════════
// Session 保護測試
// ══════════════════════════════════════════════════════════
describe('Session 保護 (規則 D)', () => {
  it('未登入存取 /api/v1/auth/session 應回傳 401', async () => {
    const res = await request(app).get('/api/v1/auth/session');
    expect(res.status).toBe(401);
  });

  it('登入後可成功取得 session 資料', async () => {
    const agent = request.agent(app);

    await agent
      .post('/api/v1/auth/login')
      .send({ Userid: 'M00006', Password: '1' });

    const res = await agent.get('/api/v1/auth/session');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.payload).toBeDefined();
    expect(res.body.payload.FromUser).toBeDefined();
    // 確認無密碼
    expect(res.body.payload.FromUser.Password).toBeUndefined();
  });
});
