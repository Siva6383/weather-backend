import db from "./db.js";

const [rows] = await db.query("SELECT 1");
console.log("DB OK:", rows);
