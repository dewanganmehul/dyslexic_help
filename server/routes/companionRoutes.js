const express = require('express');
const router = express.Router();
const { analyzeReport, parentChat, generateDashboardInsights, generateHomework } = require('../controllers/smartCompanionController');

// Route for analyzing the child's performance report
router.post('/analyze-report', analyzeReport);

// Route for the parent Q&A chat
router.post('/chat', parentChat);

// Route for mission control insights
router.post('/dashboard-insights', generateDashboardInsights);

// Route for offline homework PDFs
router.post('/homework', generateHomework);

module.exports = router;
