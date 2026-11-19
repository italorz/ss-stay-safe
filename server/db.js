import mysql from 'mysql2/promise'

// Um pool reaproveita as conexões em vez de abrir uma nova a cada requisição.
// dateStrings: colunas DATE voltam como '2026-11-10', sem conversão de fuso
// que poderia trocar o dia.
export const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'ss_stay_safe',
  waitForConnections: true,
  connectionLimit: 10,
  dateStrings: true,
})
