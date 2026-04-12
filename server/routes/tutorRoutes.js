const express = require('express');
const router = express.Router();
const { getHint } = require('../controllers/aiTutorController');

router.post('/hint', getHint);

module.exports = router;
