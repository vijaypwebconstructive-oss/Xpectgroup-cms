import mongoose from "mongoose";

const PerformanceGoalSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    unique: true, // 🔥 one goal per type
  },

  targetValue: {
    type: Number,
    required: true,
  },

}, { timestamps: true });

export default mongoose.model("PerformanceGoal", PerformanceGoalSchema);