'use strict';

const mysql = require('mysql2/promise');

/**
 * 建立 MySQL 連線池。
 * 所有連線資訊均從環境變數讀取 (規則 E)。
 */
const pool = mysql.createPool({
  host:              process.env.DB_HOST     || 'localhost',
  port:              Number(process.env.DB_PORT) || 3306,
  user:              process.env.DB_USER     || 'root',
  password:          process.env.DB_PASSWORD || 'zOl6Ozl6MySQL',
  database:          process.env.DB_NAME     || 'bpmdb',
  charset:           'utf8mb4',
  waitForConnections: true,
  connectionLimit:   10,
  timezone:          '+08:00'  // 台灣時區，規則 E
});

module.exports = pool;
