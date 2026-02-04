import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import connectDB from "./db.js";
import User from "./models/User.js";
import crypto from "crypto";
import nodemailer from "nodemailer";

dotenv.config();
connectDB();

const app = express();
const PORT = process.env.PORT || 8080;
const allowedOrigins = [
  "http://localhost:5173",
  "https://weather-frontend-nine-blush.vercel.app",
];

app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://weather-frontend-nine-blush.vercel.app"
  ],
  credentials: true
}));
app.use(express.json());

// ✅ Test Route
app.get("/", (req, res) => {
  res.send("Auth backend running 🚀");
});

app.get("/test-reset", (req, res) => {
  res.send("reset route is live");
});

// ✅ Signup
app.post("/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    console.log("📩 Signup:", username, email);

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    res.status(201).json({
      message: "Signup successful",
      userId: newUser._id,
    });

  } catch (error) {
    console.error("❌ Signup Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

//Forget Password
app.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const token = crypto.randomBytes(32).toString("hex");

    user.resetToken = token;
    user.resetTokenExpiry = Date.now() + 15 * 60 * 1000; // 15 min
    await user.save();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const link = `https://weather-frontend-nine-blush.vercel.app/reset/${token}`;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Reset your password",
      html: `
        <h3>Password Reset</h3>
        <p>Click link below:</p>
        <a href="${link}">${link}</a>
      `
    });

    res.json({ message: "Reset link sent to email" });

  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
});


//Reset Password
app.post("/reset-password/:token", async (req, res) => {
  try {
    const { password } = req.body;

    const user = await User.findOne({
      resetToken: req.params.token,
      resetTokenExpiry: { $gt: Date.now() }
    });

    if (!user) return res.status(400).json({ message: "Token expired" });

    user.password = await bcrypt.hash(password, 10);
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;

    await user.save();

    res.json({ message: "Password updated successfully" });

  } catch (e) {
    res.status(500).json({ message: "Server error" });
  }
});


// ✅ Login
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });

  } catch (error) {
    console.error("❌ Login Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server running on port ${PORT}`);
});
