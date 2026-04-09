const mongoose = require("mongoose");

const gameSessionSchema = new mongoose.Schema({
  userId: String,
  gameType: String,

  accuracy: Number,
  totalQuestions: Number,
  correctAnswers: Number,
  avgResponseTime: Number,

  errors: [String],
  errorTypes: [String], // 👈 NEW FIELD

  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("GameSession", gameSessionSchema);