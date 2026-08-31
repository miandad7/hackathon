const express = require('express');
const router = express.Router();
const { getOfficerSummary } = require('../controllers/aiController');
const { protect, requireRole } = require('../middleware/auth');

// POST /api/ai/officer-summary (Officer only)
router.post('/officer-summary', protect, requireRole('officer'), getOfficerSummary);

module.exports = router;
