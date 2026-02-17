import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: "localhost",
  user: "root",          // ganti kalau beda
  password: "",          // isi kalau ada password
  database: "smart_database", // ganti sesuai nama database kamu
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

console.log("✅ Database pool created");

export default pool;
