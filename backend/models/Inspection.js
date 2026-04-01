// models/Inspection.js
import mongoose from "mongoose";

const InspectionSchema = new mongoose.Schema({
  site: String,
  siteName: String,
  inspector: String,
  date: String,

  checklist: [
    {
      label: String,
      rating: Number,
    }
  ],
  status: {
    type: String,
    enum: ["Pass", "Fail"],
    default: "",
  },

  issues: [
    {
      title: String,
      severity: String,
    }
  ],

  comments: String,

  photos: [String],

  score: Number,
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Inspection", InspectionSchema);