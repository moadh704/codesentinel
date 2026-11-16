import { createRequire } from 'module';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();
process.env.JWT_SECRET = process.env.JWT_SECRET || 'light-demo-jwt-secret-codesentinel';

const require = createRequire(import.meta.url);
const { createStore } = require('./sqlite.cjs');

const useMysql = Boolean(process.env.DB_HOST);

let queryImpl;

if (useMysql) {
  const mysql = (await import('mysql2/promise')).default;
  const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'codesentinel',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
  });
  queryImpl = async (sql, params) => {
    const [rows] = await pool.execute(sql, params);
    return rows;
  };
} else {
  const schema = `
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS scans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT,
      language TEXT NOT NULL,
      provider TEXT NOT NULL,
      code TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      total_issues INTEGER DEFAULT 0,
      critical_count INTEGER DEFAULT 0,
      high_count INTEGER DEFAULT 0,
      medium_count INTEGER DEFAULT 0,
      low_count INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS vulnerabilities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      scan_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      severity TEXT NOT NULL,
      type TEXT NOT NULL,
      line_number INTEGER,
      description TEXT NOT NULL,
      vulnerable_code TEXT,
      fix_suggestion TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `;
  const store = createStore({ name: 'codesentinel', schema });
  const ready = (async () => {
    await store.open();
    const [rows] = await store.query('SELECT COUNT(*) AS c FROM users');
    if (Number(rows[0].c) > 0) return;
    const hash = await bcrypt.hash('Demo#2026', 10);
    await store.query(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      ['Light', 'light@codesentinel.app', hash]
    );
  })();
  queryImpl = async (sql, params = []) => {
    await ready;
    const [result] = await store.query(sql, params);
    return result;
  };
}

export const query = (sql, params) => queryImpl(sql, params);
export const getConnection = async () => ({ release() {} });
export default { query };
