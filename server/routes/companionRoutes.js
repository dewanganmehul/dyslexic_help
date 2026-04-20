const express = require('express');
const router = express.Router();
const { analyzeReport, parentChat } = require('../controllers/smartCompanionController');

// Route for analyzing the child's performance report
router.post('/analyze-report', analyzeReport);

// Route for the parent Q&A chat
router.post('/chat', parentChat);

module.exports = router;
