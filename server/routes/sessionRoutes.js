const express = require("express");
const router = express.Router();
const GameSession = require("../models/GameSession");

router.post("/submit", async (req, res) => {
  try {
    const session = new GameSession(req.body);
    await session.save();
    res.status(201).json({ message: "Session saved" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:userId", async (req, res) => {
  try {
    const sessions = await GameSession.find({
      userId: req.params.userId
    });
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;