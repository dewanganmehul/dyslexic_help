const express = require("express");
const router = express.Router();
const GameSession = require("../models/GameSession");

const { calculateRiskLevel } = require("../utils/riskEngine");

// SAVE SESSION
router.post("/submit", async (req, res) => {
  console.log("Incoming Data:", req.body); // 👈 ADD THIS

  try {
    const data = req.body;
    if (data.accuracy !== undefined && data.avgResponseTime !== undefined) {
      data.riskLevel = calculateRiskLevel(data.accuracy, data.avgResponseTime, data.metrics);
    }
    const session = new GameSession(data);
    await session.save();

    console.log("Saved Successfully"); // 👈 ADD THIS

    res.json({ message: "Session saved successfully" });
  } catch (err) {
    console.error(err); // 👈 IMPORTANT
    res.status(500).json({ error: err.message });
  }
});

// GET USER SESSIONS
router.get("/:userId", async (req, res) => {
  try {
    const sessions = await GameSession.find({
      userId: req.params.userId
    }).sort({ createdAt: -1 });

    res.json(sessions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;