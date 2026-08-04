import mongoose from "mongoose";
import { randomUUID } from "crypto";

const TimesheetSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      default: () => `timesheet-${randomUUID().slice(0, 8)}`,
    },

    workerId: {
      type: String,
      required: true,
    },

    workerName: {
      type: String,
      required: true,
    },

    siteId: {
      type: String,
      required: true,
    },

    siteName: {
      type: String,
      required: true,
    },

    date: {
      type: String,
      required: true,
    },

    clockIn: {
      type: String,
      default: "",
    },

    clockOut: {
      type: String,
      default: "",
    },

    workedHours: {
      type: Number,
      default: 0,
    },

    overtimeHours: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: [
        "Present",
        "Completed",
        "Late",
        "Half Day",
        "Early Clock-Out",
        "Missed Clock-Out",
        "Absent",
      ],
      default: "Absent",
    },
    attendanceIssue: {
      type: String,

      enum: [
        "",
        "Late Clock-In",
        "Missed Clock-Out",
        "Missed Clock-In",
        "Early Clock-Out",
      ],

      default: "",
    },

    isAutoClockOut: {
      type: Boolean,
      default: false,
    },

    isAbsentGenerated: {
      type: Boolean,
      default: false,
    },

    regularized: {
      type: Boolean,
      default: false,
    },

    notes: {
      type: String,
      default: "",
    },
    lateMinutes: {
      type: Number,
      default: 0,
    },
    regularizationRequested: {
      type: Boolean,
      default: false,
    },

    regularizationStatus: {
      type: String,
      enum: ["None", "Pending", "Approved", "Rejected"],
      default: "None",
    },
    clockInLocation: {
      latitude: Number,
      longitude: Number,
    },

    clockOutLocation: {
      latitude: Number,
      longitude: Number,
    },
  },
  {
    timestamps: true,
  },
);

TimesheetSchema.index({ siteId: 1, createdAt: 1 });
TimesheetSchema.index({ workerId: 1, createdAt: 1 });
TimesheetSchema.index({ createdAt: 1 });

const Timesheet = mongoose.model("Timesheet", TimesheetSchema);

export default Timesheet;
