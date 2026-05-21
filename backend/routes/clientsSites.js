import express from "express";
import Client from "../models/Client.js";
import Site from "../models/Site.js";
import Timesheet from "../models/Timesheet.js";
import WorkerAssignment from "../models/WorkerAssignment.js";
// import { authenticate } from '../middleware/auth.js';
// import { checkModuleAccess } from '../middleware/authorize.js';

const router = express.Router();

// router.use(authenticate, checkModuleAccess('sites'));

// ── Clients ───────────────────────────────────────────────────
router.get("/clients", async (req, res) => {
  try {
    const docs = await Client.find().sort({ createdAt: -1 }).lean();
    const list = docs.map((d) => ({
      id: d.id,
      name: d.name,
      industry: d.industry,
      contactPerson: d.contactPerson,
      email: d.email,
      phone: d.phone || "",
      contractStart: d.contractStart,
      contractEnd: d.contractEnd,
      insuranceExpiry: d.insuranceExpiry,
      address: d.address || "",
      notes: d.notes || "",
      documents: (d.documents || []).map((doc) => ({
        key: doc.key,
        name: doc.name,
        size: doc.size || 0,
        type: doc.type || "",
        uploadedAt: doc.uploadedAt || "",
        dataUrl: doc.dataUrl || "",
      })),
    }));
    res.json(list);
  } catch (err) {
    console.error("Error fetching clients:", err);
    res
      .status(500)
      .json({ error: "Failed to fetch clients", message: err.message });
  }
});

router.post("/clients", async (req, res) => {
  try {
    const {
      name,
      industry,
      contactPerson,
      email,
      phone,
      contractStart,
      contractEnd,
      insuranceExpiry,
      address,
      notes,
      documents,
      relation,
    } = req.body;
    if (
      !name ||
      !industry ||
      !contactPerson ||
      !email ||
      !contractStart ||
      !contractEnd ||
      !insuranceExpiry ||
      !relation
    ) {
      return res.status(400).json({
        error: "Validation error",
        message:
          "name, industry, contactPerson, email, contractStart, contractEnd, insuranceExpiry are required",
      });
    }
    const docsToStore = Array.isArray(documents)
      ? documents
          .filter((d) => d && d.key && d.name)
          .map((d) => ({
            key: d.key,
            name: d.name,
            size: typeof d.size === "number" ? d.size : 0,
            type: d.type || "",
            uploadedAt: d.uploadedAt || "",
            dataUrl: d.dataUrl || "",
          }))
      : [];
    const doc = await Client.create({
      name,
      industry,
      contactPerson,
      email,
      phone: phone || "",
      contractStart,
      contractEnd,
      insuranceExpiry,
      address: address || "",
      notes: notes || "",
      relation,
      documents: docsToStore,
    });
    const created = doc.toObject();
    res.status(201).json({
      id: created.id,
      name: created.name,
      industry: created.industry,
      contactPerson: created.contactPerson,
      email: created.email,
      phone: created.phone || "",
      contractStart: created.contractStart,
      contractEnd: created.contractEnd,
      insuranceExpiry: created.insuranceExpiry,
      address: created.address || "",
      notes: created.notes || "",
      relation: created.relation,
      documents: (created.documents || []).map((d) => ({
        key: d.key,
        name: d.name,
        size: d.size || 0,
        type: d.type || "",
        uploadedAt: d.uploadedAt || "",
        dataUrl: d.dataUrl || "",
      })),
    });
  } catch (err) {
    console.error("Error creating client:", err);
    res
      .status(500)
      .json({ error: "Failed to create client", message: err.message });
  }
});

router.delete("/clients/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const client = await Client.findOne({ id });
    if (!client) return res.status(404).json({ error: "Client not found" });
    const siteIds = (await Site.find({ clientId: id }).lean()).map((s) => s.id);
    await WorkerAssignment.deleteMany({ siteId: { $in: siteIds } });
    await Site.deleteMany({ clientId: id });
    await Client.deleteOne({ id });
    res.json({ success: true });
  } catch (err) {
    console.error("Error deleting client:", err);
    res
      .status(500)
      .json({ error: "Failed to delete client", message: err.message });
  }
});

// ── Sites ─────────────────────────────────────────────────────
router.get("/sites", async (req, res) => {
  try {
    const docs = await Site.find().sort({ createdAt: -1 }).lean();
    // //
    // // GET SITE WORKED HOURS
    // //
    // const { period = "current" } = req.query;

    // const list = await Promise.all(
    //   docs.map(async (d) => {
    //     //
    //     // START DATE
    //     //
    //     const startDate = new Date();

    //     //
    //     // END DATE
    //     //
    //     const endDate = new Date();

    //     //
    //     // MONTHLY
    //     //
    //     if (d.allocationPeriod === "Monthly") {
    //       //
    //       // CURRENT MONTH
    //       //
    //       if (period === "current") {
    //         startDate.setDate(1);

    //         startDate.setHours(0, 0, 0, 0);
    //       }

    //       //
    //       // PREVIOUS MONTH
    //       //
    //       if (period === "previous-month") {
    //         startDate.setMonth(startDate.getMonth() - 1);

    //         startDate.setDate(1);

    //         startDate.setHours(0, 0, 0, 0);

    //         endDate.setDate(0);

    //         endDate.setHours(23, 59, 59, 999);
    //       }
    //     }

    //     //
    //     // WEEKLY
    //     //
    //     else {
    //       //
    //       // CURRENT WEEK
    //       //
    //       if (period === "current") {
    //         const day = startDate.getDay();

    //         const diff = startDate.getDate() - day + (day === 0 ? -6 : 1);

    //         startDate.setDate(diff);

    //         startDate.setHours(0, 0, 0, 0);
    //       }

    //       //
    //       // PREVIOUS WEEK
    //       //
    //       if (period === "previous-week") {
    //         const day = startDate.getDay();

    //         const diff = startDate.getDate() - day + (day === 0 ? -6 : 1);

    //         //
    //         // PREVIOUS MONDAY
    //         //
    //         startDate.setDate(diff - 7);

    //         startDate.setHours(0, 0, 0, 0);

    //         //
    //         // PREVIOUS SUNDAY
    //         //
    //         endDate.setDate(diff - 1);

    //         endDate.setHours(23, 59, 59, 999);
    //       }
    //     } //
    //     // GET TIMESHEETS
    //     //
    //     const timesheets = await Timesheet.find({
    //       siteId: d.id,

    //       clockOut: {
    //         $ne: "",
    //       },

    //       createdAt: {
    //         $gte: startDate,

    //         $lte: endDate,
    //       },
    //     }).lean();

    //     //
    //     // TOTAL HOURS
    //     //
    //     const totalWorkedHours = timesheets.reduce(
    //       (sum, t) => sum + Number(t.workedHours || 0),
    //       0,
    //     );

    //     return {
    //       id: d.id,

    //       clientId: d.clientId,

    //       name: d.name,

    //       address: d.address || "",

    //       postcode: d.postcode || "",

    //       riskLevel: d.riskLevel || "Low",

    //       requiredTrainings: d.requiredTrainings || [],

    //       emergencyContact: d.emergencyContact || "",

    //       emergencyPhone: d.emergencyPhone || "",

    //       accessInstructions: d.accessInstructions || "",

    //       activeWorkers: d.activeWorkers ?? 0,

    //       relation: d.relation,

    //       inspectionFrequency: d.inspectionFrequency || "Monthly",

    //       complianceDocuments: (d.complianceDocuments || []).map((cd) => ({
    //         key: cd.key,
    //         name: cd.name || "",
    //         dataUrl: cd.dataUrl || "",
    //       })),

    //       allocationPeriod: d.allocationPeriod || "Weekly",

    //       allocatedHours: d.allocatedHours ?? 0,

    //       geoFence: d.geoFence || {
    //         enabled: false,
    //       },

    //       //
    //       // IMPORTANT
    //       //
    //       totalWorkedHours: Number(totalWorkedHours.toFixed(2)),
    //     };
    //   }),
    // );

    //
    // GET SITE WORKED HOURS
    //
    const { period = "current" } = req.query;

    const list = await Promise.all(
      docs.map(async (d) => {
        let startDate = new Date();

        let endDate = new Date();

        //
        // MONTHLY SITES
        //
        if (d.allocationPeriod === "Monthly") {
          //
          // CURRENT MONTH
          //
          if (period === "current") {
            startDate = new Date(
              startDate.getFullYear(),
              startDate.getMonth(),
              1,
              0,
              0,
              0,
              0,
            );

            endDate = new Date(
              startDate.getFullYear(),
              startDate.getMonth() + 1,
              0,
              23,
              59,
              59,
              999,
            );
          }

          //
          // PREVIOUS MONTH
          //
          if (period === "previous-month") {
            startDate = new Date(
              startDate.getFullYear(),
              startDate.getMonth() - 1,
              1,
              0,
              0,
              0,
              0,
            );

            endDate = new Date(
              startDate.getFullYear(),
              startDate.getMonth() + 1,
              0,
              23,
              59,
              59,
              999,
            );
          }
        }

        //
        // WEEKLY SITES
        //
        else {
          const today = new Date();

          const currentDay = today.getDay();

          //
          // MONDAY OF CURRENT WEEK
          //
          const monday = new Date(today);

          monday.setDate(
            today.getDate() - currentDay + (currentDay === 0 ? -6 : 1),
          );

          monday.setHours(0, 0, 0, 0);

          //
          // CURRENT WEEK
          //
          if (period === "current") {
            startDate = new Date(monday);

            endDate = new Date(monday);

            endDate.setDate(startDate.getDate() + 6);

            endDate.setHours(23, 59, 59, 999);
          }

          //
          // PREVIOUS WEEK
          //
          if (period === "previous-week") {
            startDate = new Date(monday);

            startDate.setDate(startDate.getDate() - 7);

            startDate.setHours(0, 0, 0, 0);

            endDate = new Date(startDate);

            endDate.setDate(startDate.getDate() + 6);

            endDate.setHours(23, 59, 59, 999);
          }
        }

        //
        // GET TIMESHEETS
        //
        const timesheets = await Timesheet.find({
          siteId: d.id,

          clockOut: {
            $ne: "",
          },

          createdAt: {
            $gte: startDate,
            $lte: endDate,
          },
        }).lean();

        //
        // TOTAL HOURS
        //
        const totalWorkedHours = timesheets.reduce(
          (sum, t) => sum + Number(t.workedHours || 0),
          0,
        );

        return {
          id: d.id,

          clientId: d.clientId,

          name: d.name,

          address: d.address || "",

          postcode: d.postcode || "",

          riskLevel: d.riskLevel || "Low",

          requiredTrainings: d.requiredTrainings || [],

          emergencyContact: d.emergencyContact || "",

          emergencyPhone: d.emergencyPhone || "",

          accessInstructions: d.accessInstructions || "",

          activeWorkers: d.activeWorkers ?? 0,

          relation: d.relation,

          inspectionFrequency: d.inspectionFrequency || "Monthly",

          complianceDocuments: (d.complianceDocuments || []).map((cd) => ({
            key: cd.key,
            name: cd.name || "",
            dataUrl: cd.dataUrl || "",
          })),

          allocationPeriod: d.allocationPeriod || "Weekly",

          allocatedHours: d.allocatedHours ?? 0,

          geoFence: d.geoFence || {
            enabled: false,
          },

          totalWorkedHours: Number(totalWorkedHours.toFixed(2)),
        };
      }),
    );
    res.json(list);
  } catch (err) {
    console.error("Error fetching sites:", err);
    res
      .status(500)
      .json({ error: "Failed to fetch sites", message: err.message });
  }
});

router.post("/sites", async (req, res) => {
  try {
    const {
      clientId,
      name,
      address,
      postcode,
      riskLevel,
      requiredTrainings,
      emergencyContact,
      emergencyPhone,
      accessInstructions,
      activeWorkers,
      complianceDocuments,
      allocationPeriod,
      allocatedHours,
      inspectionFrequency,
      inspectionAlertDays,
      geoFence,
    } = req.body;
    if (!clientId || !name) {
      return res.status(400).json({
        error: "Validation error",
        message: "clientId and name are required",
      });
    }
    const docsToStore = Array.isArray(complianceDocuments)
      ? complianceDocuments
          .filter((cd) => cd && cd.key)
          .map((cd) => ({
            key: cd.key,
            name: cd.name || "",
            dataUrl: cd.dataUrl || "",
          }))
      : [];
    const doc = await Site.create({
      clientId,
      name,
      address: address || "",
      postcode: postcode || "",
      riskLevel: riskLevel || "Low",
      requiredTrainings: Array.isArray(requiredTrainings)
        ? requiredTrainings
        : [],
      inspectionAlertDays: inspectionAlertDays || 7,
      emergencyContact: emergencyContact || "",
      emergencyPhone: emergencyPhone || "",
      accessInstructions: accessInstructions || "",
      allocationPeriod: allocationPeriod || "Weekly",
      inspectionFrequency: inspectionFrequency || "Monthly",
      allocatedHours: typeof allocatedHours === "number" ? allocatedHours : 0,
      activeWorkers: typeof activeWorkers === "number" ? activeWorkers : 0,
      complianceDocuments: docsToStore,
      geoFence: geoFence || {
        enabled: false,
      },
    });
    const fresh = await Site.findOne({ id: doc.id }).lean();
    const payloadSource = fresh || doc.toObject();
    const complianceOut = (payloadSource.complianceDocuments || []).map(
      (cd) => ({
        key: cd.key,
        name: cd.name || "",
        dataUrl: cd.dataUrl || "",
      }),
    );
    res.status(201).json({
      id: payloadSource.id,
      clientId: payloadSource.clientId,
      name: payloadSource.name,
      address: payloadSource.address || "",
      postcode: payloadSource.postcode || "",
      riskLevel: payloadSource.riskLevel || "Low",
      requiredTrainings: payloadSource.requiredTrainings || [],
      emergencyContact: payloadSource.emergencyContact || "",
      emergencyPhone: payloadSource.emergencyPhone || "",
      accessInstructions: payloadSource.accessInstructions || "",
      activeWorkers: payloadSource.activeWorkers ?? 0,
      complianceDocuments: complianceOut,
      allocationPeriod: payloadSource.allocationPeriod || "Weekly",
      geoFence: payloadSource.geoFence || {
        enabled: false,
      },
      allocatedHours: payloadSource.allocatedHours ?? 0,
    });
  } catch (err) {
    console.error("Error creating site:", err);
    res
      .status(500)
      .json({ error: "Failed to create site", message: err.message });
  }
});

router.patch("/sites/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const site = await Site.findOne({ id });

    if (!site) {
      return res.status(404).json({ error: "Site not found" });
    }

    const updates = {};

    // Basic fields
    if (typeof req.body.address === "string") {
      updates.address = req.body.address;
    }
    if (req.body.geoFence) {
      updates.geoFence = req.body.geoFence;
    }
    if (typeof req.body.postcode === "string") {
      updates.postcode = req.body.postcode;
    }

    if (typeof req.body.emergencyContact === "string") {
      updates.emergencyContact = req.body.emergencyContact;
    }

    if (typeof req.body.emergencyPhone === "string") {
      updates.emergencyPhone = req.body.emergencyPhone;
    }

    if (typeof req.body.accessInstructions === "string") {
      updates.accessInstructions = req.body.accessInstructions;
    }
    if (typeof req.body.inspectionAlertDays === "number") {
      updates.inspectionAlertDays = req.body.inspectionAlertDays;
    }
    // Trainings
    if (Array.isArray(req.body.requiredTrainings)) {
      updates.requiredTrainings = req.body.requiredTrainings;
    }
    if (req.body.geoFence) {
      updates.geoFence = req.body.geoFence;
    }
    // Allocation
    if (["Weekly", "Monthly"].includes(req.body.allocationPeriod)) {
      updates.allocationPeriod = req.body.allocationPeriod;
    }

    if (typeof req.body.allocatedHours === "number") {
      updates.allocatedHours = req.body.allocatedHours;
    }

    // Inspection
    if (["Weekly", "Monthly"].includes(req.body.inspectionFrequency)) {
      updates.inspectionFrequency = req.body.inspectionFrequency;
    }

    // Compliance docs
    if (Array.isArray(req.body.complianceDocuments)) {
      updates.complianceDocuments = req.body.complianceDocuments
        .filter((cd) => cd && cd.key)
        .map((cd) => ({
          key: cd.key,
          name: cd.name || "",
          dataUrl: cd.dataUrl || "",
        }));
    }

    const doc = await Site.findOneAndUpdate(
      { id },
      { $set: updates },
      { new: true },
    ).lean();

    res.json({
      id: doc.id,
      clientId: doc.clientId,
      name: doc.name,

      address: doc.address || "",
      postcode: doc.postcode || "",

      riskLevel: doc.riskLevel || "Low",

      requiredTrainings: doc.requiredTrainings || [],

      emergencyContact: doc.emergencyContact || "",

      emergencyPhone: doc.emergencyPhone || "",

      accessInstructions: doc.accessInstructions || "",

      allocationPeriod: doc.allocationPeriod || "Weekly",

      allocatedHours: doc.allocatedHours ?? 0,

      inspectionFrequency: doc.inspectionFrequency || "Monthly",

      activeWorkers: doc.activeWorkers ?? 0,
      geoFence: doc.geoFence || {
        enabled: false,
      },
      complianceDocuments: (doc.complianceDocuments || []).map((cd) => ({
        key: cd.key,
        name: cd.name || "",
        dataUrl: cd.dataUrl || "",
      })),
    });
  } catch (err) {
    console.error("Error updating site:", err);

    res.status(500).json({
      error: "Failed to update site",
      message: err.message,
    });
  }
});

router.delete("/sites/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const site = await Site.findOne({ id });
    if (!site) return res.status(404).json({ error: "Site not found" });
    await WorkerAssignment.deleteMany({ siteId: id });
    await Site.deleteOne({ id });
    res.json({ success: true });
  } catch (err) {
    console.error("Error deleting site:", err);
    res
      .status(500)
      .json({ error: "Failed to delete site", message: err.message });
  }
});

// ── Worker Assignments ─────────────────────────────────────────
router.get("/assignments", async (req, res) => {
  try {
    const docs = await WorkerAssignment.find().sort({ createdAt: -1 }).lean();
    const list = docs.map((d) => ({
      id: d.id,
      workerId: d.workerId,
      workerName: d.workerName,
      workerInitials: d.workerInitials || "",
      workerAvatarColor: d.workerAvatarColor || "bg-blue-500",
      siteId: d.siteId,
      siteName: d.siteName,
      clientId: d.clientId,
      completedTrainings: d.completedTrainings || [],
      complianceStatus: d.complianceStatus || "Compliant",
      assignedSince: d.assignedSince,
      role: d.role || "Cleaner",
    }));
    res.json(list);
  } catch (err) {
    console.error("Error fetching assignments:", err);
    res
      .status(500)
      .json({ error: "Failed to fetch assignments", message: err.message });
  }
});

router.post("/assignments", async (req, res) => {
  try {
    const {
      workerId,
      workerName,
      workerInitials,
      workerAvatarColor,
      siteId,
      siteName,
      clientId,
      completedTrainings,
      complianceStatus,
      assignedSince,
      role,
    } = req.body;
    if (
      !workerId ||
      !workerName ||
      !siteId ||
      !siteName ||
      !clientId ||
      !assignedSince
    ) {
      return res.status(400).json({
        error: "Validation error",
        message:
          "workerId, workerName, siteId, siteName, clientId, assignedSince are required",
      });
    }
    const doc = await WorkerAssignment.create({
      workerId,
      workerName,
      workerInitials: workerInitials || "",
      workerAvatarColor: workerAvatarColor || "bg-blue-500",
      siteId,
      siteName,
      clientId,
      completedTrainings: Array.isArray(completedTrainings)
        ? completedTrainings
        : [],
      complianceStatus: complianceStatus || "Compliant",
      assignedSince,
      role: role || "Cleaner",
    });
    res.status(201).json({
      id: doc.id,
      workerId: doc.workerId,
      workerName: doc.workerName,
      workerInitials: doc.workerInitials || "",
      workerAvatarColor: doc.workerAvatarColor || "bg-blue-500",
      siteId: doc.siteId,
      siteName: doc.siteName,
      clientId: doc.clientId,
      completedTrainings: doc.completedTrainings || [],
      complianceStatus: doc.complianceStatus || "Compliant",
      assignedSince: doc.assignedSince,
      role: doc.role || "Cleaner",
    });
  } catch (err) {
    console.error("Error creating assignment:", err);
    res
      .status(500)
      .json({ error: "Failed to create assignment", message: err.message });
  }
});

router.delete("/assignments", async (req, res) => {
  try {
    const { workerId, siteId } = req.query;
    if (!workerId || !siteId) {
      return res.status(400).json({
        error: "Validation error",
        message: "workerId and siteId query params are required",
      });
    }
    const result = await WorkerAssignment.deleteOne({ workerId, siteId });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Assignment not found" });
    }
    res.json({ success: true });
  } catch (err) {
    console.error("Error removing assignment:", err);
    res
      .status(500)
      .json({ error: "Failed to remove assignment", message: err.message });
  }
});

export default router;
