import express from "express";
import User from "../models/userModel.js";
import bcrypt from "bcrypt";
// import { authenticate } from '../middleware/auth.js';
// import { checkModuleAccess } from '../middleware/authorize.js';

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const docs = await User.find().sort({ createdAt: -1 }).lean();
    const list = docs.map((d) => ({
      id: d._id,
      fullName: d.username,
      email: d.email,
      role: d.role,
      modules: d.modules || [], // ✅ ADD THIS
      createdAt: d.createdAt
        ? new Date(d.createdAt).toISOString().split("T")[0]
        : "",
    }));
    res.json(list);
  } catch (err) {
    console.error("Error fetching users:", err);
    res
      .status(500)
      .json({ error: "Failed to fetch users", message: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const { fullName, email, role, password, modules } = req.body;

    if (!fullName || !email || !role || !password) {
      return res.status(400).json({
        error: "fullName, email, role, password are required",
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      username: fullName,
      email,
      passwordHash,
      role, // ✅ use selected role
      modules: modules || [], //
    });

    res.status(201).json({
      id: user._id,
      fullName: user.username,
      email: user.email,
      role: user.role,
      modules: user.modules, // ✅ IMPORTANT
      createdAt: user.createdAt,
    });
  } catch (err) {
    console.error("Error creating user:", err);
    res.status(500).json({
      error: "Failed to create user",
      message: err.message,
    });
  }
});

export default router;
