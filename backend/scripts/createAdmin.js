import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import User from "../models/userModel.js";

dotenv.config();

await mongoose.connect(process.env.MONGODB_URI);

const existing = await User.findOne({ username: "super" });

if (existing) {
  console.log("⚠️ Admin already exists");
  process.exit();
}

const passwordHash = await bcrypt.hash("super@123", 10);

await User.create({
  username: "super",
  passwordHash,
  role: "Supervisor",
});

console.log("✅ Admin created successfully");
process.exit();
