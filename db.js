import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

let pool;

if (process.env.MYSQL_URL) {
  // ☁ Railway MySQL
  console.log("☁ Using Railway MySQL");

  pool = mysql.createPool(process.env.MYSQL_URL);

} else {
  // 💻 Local MySQL
  console.log("💻 Using Local MySQL");

  pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 10
  });
}

export default pool;
