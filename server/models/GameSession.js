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
  errorTypes: [String],

  metrics: {
    latencyMs: Number,
    saccadicMovementScore: Number, 
    phonologicalLoopCapacity: Number, 
    letterReversals: Number, 
    ranTimeSeconds: Number, 
    phonemicSubstitutions: [String] 
  },
  riskLevel: { type: String, enum: ['Low', 'Moderate', 'High', 'Pending'], default: 'Pending' }

}, { timestamps: true });

module.exports = mongoose.model("GameSession", gameSessionSchema);