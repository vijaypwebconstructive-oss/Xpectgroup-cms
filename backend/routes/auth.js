import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import dotenv from "dotenv";
import Cleaner from "../models/Cleaner.js";
import crypto from "crypto";
import { sendPasswordResetOTP } from "../services/emailService.js";
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
    let cleaner = null;

    if (user.cleanerId) {
      cleaner = await Cleaner.findOne({
        id: user.cleanerId,
      });
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

        cleanerId: user.cleanerId || "",

        verificationStatus: cleaner?.verificationStatus || "",

        onboardingProgress: cleaner?.onboardingProgress || 0,
      },
    });
  } catch (err) {
    console.log("runed");
    res.status(500).json({ message: err.message });
  }
});

router.post("/forgot-password", async (req, res) => {
  try {
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({
        message: "Username is required",
      });
    }

    const user = await User.findOne({
      username,
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.resetOtp = otp;

    user.resetOtpExpiry = Date.now() + 1000 * 60 * 10;

    await user.save();

    await sendPasswordResetOTP(user.email, user.username, otp);

    res.json({
      message: "OTP sent successfully",
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

router.post("/reset-password", async (req, res) => {
  try {
    const { username, otp, newPassword } = req.body;

    // validation
    if (!username || !otp || !newPassword) {
      return res.status(400).json({
        message: "Username, OTP and new password are required",
      });
    }

    // find user
    const user = await User.findOne({
      username,
    }).select("+passwordHash");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // check otp
    if (user.resetOtp !== otp) {
      return res.status(400).json({
        message: "Invalid OTP",
      });
    }

    // check expiry
    if (!user.resetOtpExpiry || new Date() > new Date(user.resetOtpExpiry)) {
      return res.status(400).json({
        message: "OTP expired",
      });
    }

    // encrypt new password
    const passwordHash = await bcrypt.hash(newPassword, 10);

    // update password
    user.passwordHash = passwordHash;

    // clear otp data
    user.resetOtp = undefined;
    user.resetOtpExpiry = undefined;

    await user.save();

    res.json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (err) {
    console.error("RESET PASSWORD ERROR:", err);

    res.status(500).json({
      message: err.message,
    });
  }
});

router.post("/check-username", async (req, res) => {
  try {
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({
        exists: false,
        message: "Username is required",
      });
    }

    const existingUser = await User.findOne({
      username,
    });

    res.json({
      exists: !!existingUser,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

router.get("/me/:username", async (req, res) => {
  try {
    const { username } = req.params;

    const user = await User.findOne({
      username,
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    let cleaner = null;

    if (user.cleanerId) {
      cleaner = await Cleaner.findOne({
        id: user.cleanerId,
      });
    }

    res.json({
      id: user._id,

      username: user.username,

      role: user.role,

      module: user.modules,

      clientAccess: user.clientAccess || [],

      siteAccess: user.siteAccess || [],

      cleanerId: user.cleanerId || "",

      verificationStatus: cleaner?.verificationStatus || "",

      onboardingProgress: cleaner?.onboardingProgress || 0,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

export default router;
