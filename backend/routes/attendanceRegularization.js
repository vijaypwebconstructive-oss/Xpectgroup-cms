import express from "express";

import AttendanceRegularization from "../models/AttendanceRegularization.js";

import Timesheet from "../models/Timesheet.js";

import AttendanceSettings from "../models/AttendanceSettings.js";

const router = express.Router();

//
// CREATE REQUEST
//
router.post("/", async (req, res) => {
  try {
    const {
      workerId,
      workerName,
      timesheetId,
      type,
      reason,
      requestedClockIn,
      requestedClockOut,
    } = req.body;

    //
    // SETTINGS
    //
    const settings = await AttendanceSettings.findOne();

    //
    // LIMIT
    //
    const limit = settings?.allowedRegularizations;

    //
    // MONTH START
    //
    const startOfMonth = new Date();

    startOfMonth.setDate(1);

    startOfMonth.setHours(0, 0, 0, 0);

    //
    // MONTHLY COUNT
    //
    const count = await AttendanceRegularization.countDocuments({
      workerId,

      createdAt: {
        $gte: startOfMonth,
      },
    });

    //
    // LIMIT REACHED
    //
    if (limit !== null && count >= limit) {
      return res.status(400).json({
        error: "Monthly regularization limit reached",
      });
    }

    //
    // EXISTING REQUEST
    //
    const existing = await AttendanceRegularization.findOne({
      timesheetId,

      status: "Pending",
    });

    if (existing) {
      return res.status(400).json({
        error: "Regularization already requested",
      });
    }

    //
    // CREATE
    //
    const request = await AttendanceRegularization.create({
      workerId,

      workerName,

      timesheetId,

      type,

      reason,

      requestedClockIn: requestedClockIn || "",

      requestedClockOut: requestedClockOut || "",
    });

    //
    // UPDATE TIMESHEET
    //
    await Timesheet.findOneAndUpdate(
      {
        id: timesheetId,
      },
      {
        regularizationRequested: true,

        regularizationStatus: "Pending",
      },
    );

    res.status(201).json(request);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to create request",
    });
  }
});

//
// GET ALL
//
router.get("/", async (req, res) => {
  try {
    const requests = await AttendanceRegularization.find()
      .sort({
        createdAt: -1,
      })
      .lean();

    res.json(requests);
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch requests",
    });
  }
});

//
// REVIEW REQUEST
//
router.patch("/:id/review", async (req, res) => {
  try {
    const { id } = req.params;

    const { status, adminName, adminNotes, updatedClockIn, updatedClockOut } =
      req.body;

    const request = await AttendanceRegularization.findOne({
      id,
    });

    if (!request) {
      return res.status(404).json({
        error: "Request not found",
      });
    }

    //
    // UPDATE REQUEST
    //
    request.status = status;

    request.reviewedBy = adminName;

    request.reviewedAt = new Date().toISOString();

    request.adminNotes = adminNotes || "";

    request.updatedClockIn = updatedClockIn || "";

    request.updatedClockOut = updatedClockOut || "";

    await request.save();

    //
    // UPDATE TIMESHEET
    //
    const timesheet = await Timesheet.findOne({
      id: request.timesheetId,
    });

    if (timesheet) {
      if (updatedClockIn) {
        timesheet.clockIn = updatedClockIn;
      }

      if (updatedClockOut) {
        timesheet.clockOut = updatedClockOut;
      }

      //
      // RECALCULATE HOURS
      //
      if (timesheet.clockIn && timesheet.clockOut) {
        const start = new Date(timesheet.clockIn);

        const end = new Date(timesheet.clockOut);

        const diffMs = end.getTime() - start.getTime();

        const workedHours = diffMs / (1000 * 60 * 60);

        timesheet.workedHours = Number(workedHours.toFixed(2));

        //
        // KEEP REGULARIZED STATUS
        //
        if (status === "Approved") {
          timesheet.regularized = true;
        }
      }

      timesheet.regularizationStatus = status;

      await timesheet.save();
    }

    res.json(request);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to review request",
    });
  }
});
export default router;
