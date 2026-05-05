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
      enum: ["Admin", "Supervisor", "Custom"], // ✅ ADD Custom
    },

    modules: {
      type: [String], // ✅ ADD THIS
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("User", userSchema);
