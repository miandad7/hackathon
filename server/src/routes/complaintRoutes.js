const express = require('express');
const router = express.Router();
const {
  getComplaints,
  createComplaint,
  getMyComplaints,
  exportComplaintsCSV,
  getComplaintById,
  upvoteComplaint,
  updateComplaintStatus,
  submitFeedback
} = require('../controllers/complaintController');

const { protect, requireRole } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Base route: /api/complaints

// Public list & filter endpoint
router.get('/', getComplaints);

// Citizen create complaint with optional photo upload
router.post('/', protect, requireRole('citizen'), upload.single('image'), createComplaint);

// Static routes MUST be declared BEFORE /:id to preventExpress matching 'mine' or 'export' as an :id parameter
router.get('/mine', protect, requireRole('citizen'), getMyComplaints);
router.get('/export', protect, requireRole('officer'), exportComplaintsCSV);

// Parameterized routes
router.get('/:id', getComplaintById);
router.patch('/:id/upvote', protect, requireRole('citizen'), upvoteComplaint);
router.patch('/:id/status', protect, requireRole('officer'), updateComplaintStatus);
router.patch('/:id/feedback', protect, requireRole('citizen'), submitFeedback);

module.exports = router;
