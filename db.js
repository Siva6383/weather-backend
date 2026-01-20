import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const db = await mysql.createPool(process.env.MYSQL_URL);

console.log("✅ MySQL Connected Successfully");

export default db;
