import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    email: {
      type: String,
    },
    role: {
      type: String,
      required: true,
      enum: ["Admin", "Supervisor", "Custom", "Default"], // ✅ ADD Custom
    },

    modules: {
      type: [String], // ✅ ADD THIS
      default: [],
    },
    clientAccess: {
      type: [String], // ✅ ADD THIS
      default: [],
    },
    siteAccess: {
      type: [String], // ✅ ADD THIS
      default: [],
    },
    cleanerId: {
      type: String,
    },
    resetOtp: {
      type: String,
    },

    resetOtpExpiry: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("User", userSchema);
