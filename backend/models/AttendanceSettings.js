import mongoose from "mongoose";

const AttendanceSettingsSchema = new mongoose.Schema(
  {
    globalClockInTime: {
      type: String,
      default: "09:00",
    },

    globalClockOutTime: {
      type: String,
      default: "18:00",
    },

    graceMinutes: {
      type: Number,
      default: 15,
    },

    autoClockOut: {
      type: Boolean,
      default: false,
    },
    notifyLateClockIn: {
      type: Boolean,
      default: true,
    },
    allowedRegularizations: {
      type: Number,
      default: null,
    },

    notifyEarlyClockOut: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

const AttendanceSettings = mongoose.model(
  "AttendanceSettings",
  AttendanceSettingsSchema,
);

export default AttendanceSettings;
