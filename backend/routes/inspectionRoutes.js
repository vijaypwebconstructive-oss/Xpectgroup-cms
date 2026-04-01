// routes/inspectionRoutes.js
import express from "express";
import Inspection from "../models/Inspection.js";

const router = express.Router();

// 🔥 CREATE
router.post("/", async (req, res) => {
  try {
    const inspection = new Inspection(req.body);
    const saved = await inspection.save();
    res.json(saved);
  } catch (err) {
    res.status(500).json(err);
  }
});

// 🔥 GET ALL
router.get("/", async (req, res) => {
  const list = await Inspection.find().sort({ createdAt: -1 });
  res.json(list);
});

// 🔥 GET ONE
router.get("/:id", async (req, res) => {
  const item = await Inspection.findById(req.params.id);
  res.json(item);
});

// 🔥 DELETE INSPECTION
router.delete("/:id", async (req, res) => {
  try {
    await Inspection.findByIdAndDelete(req.params.id);
    res.json({ message: "Inspection deleted successfully" });
  } catch (err) {
    res.status(500).json(err);
  }
});

export default router;