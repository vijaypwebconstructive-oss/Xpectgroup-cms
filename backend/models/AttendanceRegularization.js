import mongoose from "mongoose";

import { randomUUID } from "crypto";

const AttendanceRegularizationSchema = new mongoose.Schema(
  {
    id: {
      type: String,

      required: true,

      unique: true,

      default: () => `reg-${randomUUID().slice(0, 8)}`,
    },

    //
    // Worker
    //
    workerId: {
      type: String,

      required: true,
    },

    requestedClockIn: {
      type: String,
      default: "",
    },

    requestedClockOut: {
      type: String,
      default: "",
    },

    workerName: {
      type: String,

      required: true,
    },

    //
    // Timesheet
    //
    timesheetId: {
      type: String,

      required: true,
    },

    //
    // Request type
    //
    type: {
      type: String,

      enum: [
        "Late Clock-In",
        "Missed Clock-Out",
        "Missed Clock-In",
        "Missed Clock-In & Clock-Out",
        "Early Clock-Out",
      ],

      required: true,
    },

    //
    // Reason
    //
    reason: {
      type: String,

      default: "",
    },

    //
    // Status
    //
    status: {
      type: String,

      enum: ["Pending", "Approved", "Rejected"],

      default: "Pending",
    },

    //
    // Admin review
    //
    reviewedBy: {
      type: String,

      default: "",
    },

    reviewedAt: {
      type: String,

      default: "",
    },

    adminNotes: {
      type: String,

      default: "",
    },
  },
  {
    timestamps: true,
  },
);

const AttendanceRegularization = mongoose.model(
  "AttendanceRegularization",
  AttendanceRegularizationSchema,
);

export default AttendanceRegularization;
