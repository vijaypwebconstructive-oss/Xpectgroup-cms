import express from "express";
import Timesheet from "../models/Timesheet.js";
import Cleaner from "../models/Cleaner.js";
import Site from "../models/Site.js";
import WorkerAssignment from "../models/WorkerAssignment.js";
import AttendanceSettings from "../models/AttendanceSettings.js";
import { getDistance } from "geolib";
import cron from "node-cron";
const router = express.Router();
import User from "../models/userModel.js";
import { sendAttendanceAlert } from "../services/emailService.js";

const getAdminEmails = async () => {
  const admins = await User.find({
    role: "Admin",
  }).lean();

  return admins.map((admin) => admin.email).filter(Boolean);
};
//
// GET ALL TIMESHEETS
//
router.get("/", async (req, res) => {
  try {
    const timesheets = await Timesheet.find().sort({ createdAt: -1 }).lean();

    res.json(timesheets);
  } catch (error) {
    console.error("Error fetching timesheets:", error);

    res.status(500).json({
      error: "Failed to fetch timesheets",
    });
  }
});

//
// GET ACTIVE SHIFTS
//
router.get("/active", async (req, res) => {
  try {
    const activeShifts = await Timesheet.find({
      clockOut: "",
    })
      .sort({ createdAt: -1 })
      .lean();

    res.json(activeShifts);
  } catch (error) {
    console.error("Error fetching active shifts:", error);

    res.status(500).json({
      error: "Failed to fetch active shifts",
    });
  }
});

//
// GET ATTENDANCE SETTINGS
//
router.get("/settings", async (req, res) => {
  try {
    let settings = await AttendanceSettings.findOne();

    //
    // Create default if not exists
    //
    if (!settings) {
      settings = await AttendanceSettings.create({});
    }

    res.json(settings);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to fetch settings",
    });
  }
});

//
// UPDATE ATTENDANCE SETTINGS
//
router.patch("/settings", async (req, res) => {
  try {
    let settings = await AttendanceSettings.findOne();

    //
    // Create if not exists
    //
    if (!settings) {
      settings = await AttendanceSettings.create(req.body);
    } else {
      Object.assign(settings, req.body);

      await settings.save();
    }

    res.json(settings);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to update settings",
    });
  }
});

//
// CLOCK IN
//
router.post("/clock-in", async (req, res) => {
  try {
    const { workerId, siteId, latitude, longitude } = req.body;

    //
    // Validation
    //
    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({
        error: "Location is required",
      });
    }

    //
    // Find worker
    //
    const worker = await Cleaner.findOne({
      id: workerId,
    });

    if (!worker) {
      return res.status(404).json({
        error: "Worker not found",
      });
    }

    //
    // Find site
    //
    const site = await Site.findOne({
      id: siteId,
    });

    //
    // GET SETTINGS
    //
    const settings = await AttendanceSettings.findOne();

    if (!site) {
      return res.status(404).json({
        error: "Site not found",
      });
    }

    //
    // Check worker assigned
    //
    const assignment = await WorkerAssignment.findOne({
      workerId,
      siteId,
    });

    if (!assignment) {
      return res.status(403).json({
        error: "Worker is not assigned to this site",
      });
    }
    //
    // GEO FENCE VALIDATION
    //
    if (site.geoFence?.enabled && site.geoFence?.coordinates) {
      const siteLatitude = site.geoFence.coordinates.latitude;

      const siteLongitude = site.geoFence.coordinates.longitude;

      const siteRadius = site.geoFence.radius || 100;

      //
      // Calculate distance
      //
      const distance = getDistance(
        {
          latitude,
          longitude,
        },
        {
          latitude: siteLatitude,
          longitude: siteLongitude,
        },
      );

      //
      // Outside allowed radius
      //
      if (distance > siteRadius) {
        return res.status(403).json({
          error: "You are outside the allowed site area",

          distance,

          allowedRadius: siteRadius,
        });
      }
    }
    //
    // Prevent multiple active shifts
    //
    const existingShift = await Timesheet.findOne({
      workerId,
      clockOut: "",
    });

    if (existingShift) {
      return res.status(400).json({
        error: "Worker already has an active shift",
      });
    }

    //
    // Current date/time
    //
    const now = new Date();
    //
    // DEFAULT
    //
    let lateMinutes = 0;
    //
    // LATE DETECTION
    //
    if (settings) {
      //
      // Example:
      // "09:00"
      //
      const [hours, minutes] = settings.globalClockInTime.split(":");

      //
      // SHIFT START TIME
      //
      const shiftStart = new Date(now);

      shiftStart.setHours(Number(hours));

      shiftStart.setMinutes(Number(minutes));

      shiftStart.setSeconds(0);

      //
      // GRACE PERIOD
      //
      shiftStart.setMinutes(shiftStart.getMinutes() + settings.graceMinutes);

      //
      // CHECK LATE
      //
      if (now > shiftStart) {
        lateMinutes = Math.floor(
          (now.getTime() - shiftStart.getTime()) / (1000 * 60),
        );
      }
    }
    //
    // Create timesheet
    //
    const timesheet = await Timesheet.create({
      workerId: worker.id,

      workerName: worker.name,

      siteId: site.id,

      siteName: site.name,
      clockInLocation: {
        latitude,
        longitude,
      },
      lateMinutes,
      date: now.toISOString().split("T")[0],

      clockIn: now.toISOString(),

      status: lateMinutes > 0 ? "Late" : "Present",

      attendanceIssue: lateMinutes > 0 ? "Late Clock-In" : "",
    });
    //
    // SEND LATE ALERT
    //
    if (lateMinutes > 0 && settings?.notifyLateClockIn !== false) {
      const adminEmails = await getAdminEmails();

      if (adminEmails.length > 0) {
        await sendAttendanceAlert({
          emails: adminEmails,

          workerName: worker.name,

          siteName: site.name,

          type: "late",

          minutes: lateMinutes,

          attendanceTime: now.toLocaleTimeString(),
        });
      }
    }
    res.status(201).json(timesheet);
  } catch (error) {
    console.error("Clock in error:", error);

    res.status(500).json({
      error: "Failed to clock in",
    });
  }
});

//
// CLOCK OUT
//
router.patch("/:id/clock-out", async (req, res) => {
  try {
    const { id } = req.params;
    const { latitude, longitude } = req.body;
    //
    // Find active shift
    //
    const timesheet = await Timesheet.findOne({
      id,
    });

    if (!timesheet) {
      return res.status(404).json({
        error: "Timesheet not found",
      });
    }

    if (timesheet.clockOut) {
      return res.status(400).json({
        error: "Shift already completed",
      });
    }

    //
    // Clock out time
    //
    const now = new Date();

    //
    // Calculate hours
    //
    const clockInTime = new Date(timesheet.clockIn);

    const diffMs = now.getTime() - clockInTime.getTime();

    const workedHours = Number((diffMs / (1000 * 60 * 60)).toFixed(2));

    //
    // Overtime logic
    //
    let overtimeHours = 0;

    let earlyClockOut = false;

    let earlyMinutes = 0;

    //
    // SHIFT HOURS
    //
    let expectedShiftHours = 0;

    let halfDayThreshold = 0;

    const site = await Site.findOne({
      id: timesheet.siteId,
    });
    //

    const settings = await AttendanceSettings.findOne();

    //
    // CALCULATE EXPECTED SHIFT HOURS
    //
    if (settings?.globalClockInTime && settings?.globalClockOutTime) {
      const [startHour, startMinute] = settings.globalClockInTime.split(":");

      const [endHour, endMinute] = settings.globalClockOutTime.split(":");

      //
      // SHIFT START
      //
      const shiftStart = new Date(now);

      shiftStart.setHours(Number(startHour));

      shiftStart.setMinutes(Number(startMinute));

      shiftStart.setSeconds(0);

      //
      // SHIFT END
      //
      const shiftEnd = new Date(now);

      shiftEnd.setHours(Number(endHour));

      shiftEnd.setMinutes(Number(endMinute));

      shiftEnd.setSeconds(0);

      //
      // TOTAL SHIFT HOURS
      //
      expectedShiftHours =
        (shiftEnd.getTime() - shiftStart.getTime()) / (1000 * 60 * 60);

      //
      // HALF DAY LIMIT
      //
      halfDayThreshold = expectedShiftHours / 2;
    }
    // EARLY CLOCK-OUT CHECK
    //
    if (settings?.globalClockOutTime) {
      const [hours, minutes] = settings.globalClockOutTime.split(":");

      const expectedEnd = new Date(now);

      expectedEnd.setHours(Number(hours));

      expectedEnd.setMinutes(Number(minutes));

      expectedEnd.setSeconds(0);

      //
      // Early logout
      //
      if (now < expectedEnd) {
        earlyClockOut = true;

        earlyMinutes = Math.floor(
          (expectedEnd.getTime() - now.getTime()) / (1000 * 60),
        );
      }
    }
    //
    // GEO FENCE VALIDATION
    //
    if (site?.geoFence?.enabled && site?.geoFence?.coordinates) {
      const distance = getDistance(
        {
          latitude,
          longitude,
        },
        {
          latitude: site.geoFence.coordinates.latitude,

          longitude: site.geoFence.coordinates.longitude,
        },
      );

      if (distance > site.geoFence.radius) {
        return res.status(403).json({
          error: "You must be inside site area to clock out",
        });
      }
    }

    if (site && site.allocatedHours) {
      //
      // Today's site hours
      //
      const todayHours = await Timesheet.aggregate([
        {
          $match: {
            siteId: site.id,
            clockOut: {
              $ne: "",
            },
          },
        },
        {
          $group: {
            _id: null,
            total: {
              $sum: "$workedHours",
            },
          },
        },
      ]);

      const totalWorked = (todayHours[0]?.total || 0) + workedHours;

      if (totalWorked > site.allocatedHours) {
        overtimeHours = Number((totalWorked - site.allocatedHours).toFixed(2));
      }
    }

    //
    // Update
    //
    timesheet.clockOut = now.toISOString();

    timesheet.clockOutLocation = {
      latitude,
      longitude,
    };

    timesheet.workedHours = workedHours;

    timesheet.overtimeHours = overtimeHours;

    //
    // STATUS LOGIC
    //
    if (workedHours < halfDayThreshold) {
      //
      // ABSENT
      //
      timesheet.status = "Absent";

      timesheet.attendanceIssue = "Early Clock-Out";
    } else if (
      workedHours >= halfDayThreshold &&
      workedHours < expectedShiftHours
    ) {
      //
      // HALF DAY
      //
      timesheet.status = "Half Day";

      timesheet.attendanceIssue = "Early Clock-Out";
    } else {
      //
      // FULL SHIFT
      //
      if (timesheet.lateMinutes > 0) {
        timesheet.status = "Late";
      } else {
        timesheet.status = "Completed";
      }

      timesheet.attendanceIssue = "";
    }

    await timesheet.save();

    //
    // SEND EARLY CLOCK-OUT ALERT
    //
    if (earlyClockOut && settings?.notifyEarlyClockOut !== false) {
      const adminEmails = await getAdminEmails();
      timesheet.attendanceIssue = "Early Clock-Out";

      if (adminEmails.length > 0) {
        await sendAttendanceAlert({
          emails: adminEmails,

          workerName: timesheet.workerName,

          siteName: timesheet.siteName,

          type: "early",

          minutes: earlyMinutes,

          attendanceTime: now.toLocaleTimeString(),
        });
      }
    }

    res.json(timesheet);
  } catch (error) {
    console.error("Clock out error:", error);

    res.status(500).json({
      error: "Failed to clock out",
    });
  }
});

//
// DELETE TIMESHEET
//
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Timesheet.findOneAndDelete({
      id,
    });

    if (!deleted) {
      return res.status(404).json({
        error: "Timesheet not found",
      });
    }

    res.json({
      success: true,
    });
  } catch (error) {
    console.error("Delete error:", error);

    res.status(500).json({
      error: "Failed to delete timesheet",
    });
  }
});

//
// GET ASSIGNED SITES FOR WORKER
//
router.get("/my-sites/:workerId", async (req, res) => {
  try {
    const { workerId } = req.params;

    //
    // Find assignments
    //
    const assignments = await WorkerAssignment.find({
      workerId,
    }).lean();

    //
    // Return site list
    //
    const sites = assignments.map((a) => ({
      id: a.siteId,
      name: a.siteName,
    }));

    res.json(sites);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to fetch assigned sites",
    });
  }
});

export default router;

const autoClockOut = async () => {
  try {
    const settings = await AttendanceSettings.findOne();

    if (!settings?.autoClockOut) {
      return;
    }

    const now = new Date();

    const activeShifts = await Timesheet.find({
      clockOut: "",
    });

    for (const shift of activeShifts) {
      shift.clockOut = now.toISOString();

      const start = new Date(shift.clockIn);

      const diffMs = now.getTime() - start.getTime();

      shift.workedHours = Number((diffMs / (1000 * 60 * 60)).toFixed(2));

      shift.status = "Missed Clock-Out";

      shift.attendanceIssue = "Missed Clock-Out";

      shift.isAutoClockOut = true;

      await shift.save();
    }

    console.log("11:59 PM auto clock-out completed");
  } catch (error) {
    console.error(error);
  }
};

cron.schedule("59 23 * * *", async () => {
  await autoClockOut();
});

const generateAbsentAttendance = async () => {
  try {
    const today = new Date().toISOString().split("T")[0];

    const cleaners = await Cleaner.find();

    for (const cleaner of cleaners) {
      const existing = await Timesheet.findOne({
        workerId: cleaner.id,

        date: today,
      });

      if (existing) {
        continue;
      }

      await Timesheet.create({
        workerId: cleaner.id,

        workerName: cleaner.name,

        siteId: "",

        siteName: "",

        date: today,

        clockIn: "",

        clockOut: "",

        workedHours: 0,

        overtimeHours: 0,

        status: "Absent",

        attendanceIssue: "Missed Clock-In",

        isAbsentGenerated: true,
      });
    }

    console.log("Absent generation completed");
  } catch (error) {
    console.error(error);
  }
};

cron.schedule("59 23 * * *", async () => {
  await generateAbsentAttendance();
});
