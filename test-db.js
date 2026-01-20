import db from "./db.js";

try {
  const [rows] = await db.query("SELECT 1");
  console.log("✅ Database connected:", rows);
} catch (err) {
  console.error("❌ Database error:", err);
}