import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import db from "./db.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors({
  origin: "https://weather-frontend-nine-blush.vercel.app",
  credentials: true
}));
app.use(express.json());

const [dbName] = await db.query("SELECT DATABASE() AS db");
console.log("📌 Connected Database:", dbName[0].db);

// ✅ Signup API
app.post("/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    console.log("📩 Signup request received:", username, email);

    const [existingUser] = await db.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    console.log("🔍 Existing user result:", existingUser);

    if (existingUser.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("🔐 Password hashed");

    const [tableInfo] = await db.query("SHOW CREATE TABLE users");
console.log("📋 Users Table:", tableInfo[0]["Create Table"]);


    const result = await db.query(
      "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
      [username, email, hashedPassword]
    );

    console.log("✅ Insert result:", result);

    res.status(201).json({ message: "Signup successful" });

  } catch (error) {
    console.error("❌ Signup Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});




// ✅ Login API
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const [user] = await db.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (user.length === 0) {
      return res.status(400).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user[0].password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    res.status(200).json({
      message: "Login successful",
      user: {
        id: user[0].id,
        username: user[0].username,
        email: user[0].email
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});


// Test Route
app.get("/", (req, res) => {
  res.send("Auth backend running 🚀");
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server running on port ${PORT}`);
});
