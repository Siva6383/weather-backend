import mysql from "mysql2/promise";

if (!process.env.MYSQL_PUBLIC_URL && !process.env.DB_PASSWORD) {
  throw new Error("❌ No database credentials found");
}

let pool;

if (process.env.MYSQL_PUBLIC_URL) {
  console.log("☁ Using Railway MySQL");
  pool = mysql.createPool(process.env.MYSQL_PUBLIC_URL);
} else {
  console.log("💻 Using Local MySQL");
  pool = mysql.createPool({
    host: "localhost",
    user: "root",
    password: process.env.DB_PASSWORD,
    database: "weather_detection",
  });
}

export default pool;
