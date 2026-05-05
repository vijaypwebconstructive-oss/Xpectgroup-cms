import express from "express";
import { getDashboardData,getMonthlyMetrics,recentTransation,getSalesTransactions} from "../services/performanceService.js";
import PerformanceGoal from "../models/PerformanceGoal.js";
const router = express.Router();

router.get("/dashboard", async (req, res) => {
  try {
    const { filter, offset } = req.query;
    const data = await getDashboardData(filter, Number(offset) || 0);
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching performance data" });
  }
});



router.post("/goals", async (req, res) => {
  try {
    const { type, targetValue } = req.body;

    const goal = await PerformanceGoal.findOneAndUpdate(
      { type },
      { targetValue },
      { new: true, upsert: true }
    );

    res.json(goal);
  } catch (err) {
    res.status(500).json({ message: "Error saving goal" });
  }
});

router.get("/goals", async (req, res) => {
  try {
    const goals = await PerformanceGoal.find();

    const formatted = {};
    goals.forEach((g) => {
      formatted[g.type] = g.targetValue;
    });

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ message: "Error fetching goals" });
  }
});

router.get("/charts", async (req, res) => {
  try {
    const { filter, offset } = req.query;
    const data = await getMonthlyMetrics(filter, Number(offset) || 0);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/monthly", async (req, res) => {
  try {
    const { filter, offset } = req.query;

    const data = await getMonthlyMetrics(filter, Number(offset) || 0);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.get("/tractions", async (req, res) => {
  try {
    const { filter, offset } = req.query;

    const data = await recentTransation(filter, Number(offset) || 0);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/sales", async (req, res) => {
  try {
    const { filter, offset } = req.query;

    const data = await getSalesTransactions(filter, Number(offset) || 0);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


export default router;