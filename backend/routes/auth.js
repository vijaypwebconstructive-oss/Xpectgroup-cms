// import express from "express";
// import bcrypt from "bcrypt";
// import jwt from "jsonwebtoken";
// import SystemUser from "../models/SystemUser.js";

// const router = express.Router();

// const JWT_SECRET = process.env.JWT_SECRET || "xpect-onboarding-secret-key-change-in-production";
// const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

// /** POST /api/auth/login — CMS SystemUser login (issues JWT for authenticate middleware). */
// router.post("/login", async (req, res) => {
//   try {
//     const email = String(req.body?.email || "")
//       .trim()
//       .toLowerCase();
//     const password = req.body?.password;
//     if (!email || !password) {
//       return res.status(400).json({
//         error: "Validation error",
//         message: "email and password are required",
//       });
//     }

//     const user = await SystemUser.findOne({ email })
//       .select("+passwordHash")
//       .lean();
//     if (!user || !user.passwordHash) {
//       return res.status(401).json({
//         error: "Unauthorized",
//         message: "Invalid email or password",
//       });
//     }
//     if (user.status !== "active") {
//       return res.status(401).json({
//         error: "Unauthorized",
//         message: "Account is not active",
//       });
//     }

//     const ok = await bcrypt.compare(String(password), user.passwordHash);
//     if (!ok) {
//       return res.status(401).json({
//         error: "Unauthorized",
//         message: "Invalid email or password",
//       });
//     }

//     const token = jwt.sign(
//       { id: user.id, role: user.role },
//       JWT_SECRET,
//       { expiresIn: JWT_EXPIRES_IN },
//     );

//     try {
//       await SystemUser.updateOne(
//         { id: user.id },
//         { $set: { lastLogin: new Date().toISOString() } },
//       );
//     } catch {
//       /* non-fatal */
//     }

//     return res.json({
//       token,
//       user: {
//         id: user.id,
//         fullName: user.fullName,
//         email: user.email,
//         role: user.role,
//       },
//     });
//   } catch (err) {
//     console.error("Login error:", err);
//     return res.status(500).json({
//       error: "Login failed",
//       message: err.message,
//     });
//   }
// });

// export default router;

import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username }).select("+passwordHash");

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const match = await bcrypt.compare(password, user.passwordHash);

    if (!match) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, {
      expiresIn: "1d",
    });

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
        module: user.modules,
      },
    });
  } catch (err) {
    console.log("runed");
    res.status(500).json({ message: err.message });
  }
});

export default router;
