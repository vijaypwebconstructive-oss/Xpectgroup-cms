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

      modules: d.modules || [],

      clientAccess: d.clientAccess || [],
      siteAccess: d.siteAccess || [],

      cleanerId: d.cleanerId || "",

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

router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).lean();

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json({
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      modules: user.modules || [],
      clientAccess: user.clientAccess || [],
      siteAccess: user.siteAccess || [],
      cleanerId: user.cleanerId || null,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    // Only access settings can be changed here (never username/password hash)
    const allowedFields = ["role", "modules", "clientAccess", "siteAccess"];
    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    }

    const updated = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true },
    ).lean();

    if (!updated) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Same shape as GET / so the frontend list stays consistent
    res.json({
      id: updated._id,
      fullName: updated.username,
      email: updated.email,
      role: updated.role,
      modules: updated.modules || [],
      clientAccess: updated.clientAccess || [],
      siteAccess: updated.siteAccess || [],
      cleanerId: updated.cleanerId || "",
      createdAt: updated.createdAt
        ? new Date(updated.createdAt).toISOString().split("T")[0]
        : "",
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

router.post("/", async (req, res) => {
  try {
    const {
      fullName,
      email,
      role,
      password,
      modules,
      clientAccess,
      siteAccess,
      cleanerId,
    } = req.body;
    const username = fullName?.trim();

    if (!username || !email || !role || !password) {
      return res.status(400).json({
        error: "fullName, email, role, password are required",
        message: "Username, email, role and password are required.",
      });
    }

    const existingUser = await User.findOne({ username }).lean();
    if (existingUser) {
      return res.status(409).json({
        error: "Username taken",
        field: "username",
        message:
          "This username is already taken. Please choose a different username.",
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      email,
      passwordHash,
      role, // ✅ use selected role
      modules: modules || [], //
      clientAccess: clientAccess || [],
      siteAccess: siteAccess || [],
      cleanerId: cleanerId,
    });

    res.status(201).json({
      id: user._id,
      fullName: user.username,
      email: user.email,
      role: user.role,
      modules: user.modules,
      clientAccess: user.clientAccess || [],
      siteAccess: user.siteAccess || [],

      cleanerId: user.cleanerId || "", // ✅ IMPORTANT
      createdAt: user.createdAt,
    });
  } catch (err) {
    console.error("Error creating user:", err);
    if (err.code === 11000) {
      return res.status(409).json({
        error: "Username taken",
        field: "username",
        message:
          "This username is already taken. Please choose a different username.",
      });
    }
    res.status(500).json({
      error: "Failed to create user",
      message: err.message,
    });
  }
});

export default router;
