const mongoose = require("mongoose");

const gameSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  gameType: String,
  level: String,

  accuracy: Number,
  totalQuestions: Number,
  correctAnswers: Number,
  avgResponseTime: Number,

  errors: [String],
  errorTypes: [String]

}, { timestamps: true });

module.exports = mongoose.model("GameSession", gameSessionSchema);