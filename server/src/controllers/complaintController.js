const Complaint = require('../models/Complaint');
const { parse } = require('json2csv');
const { uploadToCloudinary } = require('../utils/cloudinary');

// Helper to filter and sort complaints array in memory if needed
const getFilteredComplaints = async (query) => {
  const { category, area, status, search, sortBy } = query;
  let filter = {};

  if (category) {
    filter.category = category;
  }

  if (area) {
    filter.area = { $regex: area, $options: 'i' };
  }

  if (status) {
    const statusArray = status.split(',').map((s) => s.trim()).filter(Boolean);
    if (statusArray.length > 0) {
      filter.status = { $in: statusArray };
    }
  }

  if (search) {
    const searchRegex = { $regex: search, $options: 'i' };
    filter.$or = [
      { title: searchRegex },
      { description: searchRegex },
      { area: searchRegex }
    ];
  }

  let complaints = await Complaint.find(filter)
    .populate('createdBy', 'name email')
    .exec();

  // Convert to plain JS objects to ensure virtuals (priority, priorityScore) are present
  let result = complaints.map((doc) => doc.toObject({ virtuals: true }));

  // Sorting logic
  if (sortBy === 'upvotes') {
    result.sort((a, b) => b.upvotes - a.upvotes);
  } else if (sortBy === 'priority') {
    result.sort((a, b) => b.priorityScore - a.priorityScore);
  } else {
    // Default: newest
    result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  return result;
};

// @desc    Get public feed of complaints with filters & sorting
// @route   GET /api/complaints
// @access  Public
const getComplaints = async (req, res, next) => {
  try {
    const complaints = await getFilteredComplaints(req.query);
    res.status(200).json({
      count: complaints.length,
      complaints
    });
  } catch (error) {
    next(error);
  }
};

// @desc    File a new complaint
// @route   POST /api/complaints
// @access  Citizen
const createComplaint = async (req, res, next) => {
  try {
    const { title, description, category, area } = req.body;

    if (!title || !description || !category || !area) {
      return res.status(400).json({ message: 'Please fill in all required fields (title, description, category, area)' });
    }

    let imageUrl = null;
    if (req.file) {
      imageUrl = await uploadToCloudinary(req.file.path);
    }

    const complaint = await Complaint.create({
      title,
      description,
      category,
      area,
      imageUrl,
      createdBy: req.user._id
    });

    const populatedComplaint = await Complaint.findById(complaint._id).populate('createdBy', 'name email');

    res.status(201).json({
      message: 'Complaint filed successfully',
      complaint: populatedComplaint.toObject({ virtuals: true })
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get complaints filed by current user
// @route   GET /api/complaints/mine
// @access  Citizen
const getMyComplaints = async (req, res, next) => {
  try {
    const complaints = await Complaint.find({ createdBy: req.user._id })
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    const result = complaints.map((doc) => doc.toObject({ virtuals: true }));

    res.status(200).json({
      count: result.length,
      complaints: result
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Export filtered complaints to CSV
// @route   GET /api/complaints/export
// @access  Officer
const exportComplaintsCSV = async (req, res, next) => {
  try {
    const complaints = await getFilteredComplaints(req.query);

    const fields = [
      { label: 'Complaint ID', value: '_id' },
      { label: 'Title', value: 'title' },
      { label: 'Category', value: 'category' },
      { label: 'Area', value: 'area' },
      { label: 'Status', value: 'status' },
      { label: 'Priority', value: 'priority' },
      { label: 'Priority Score', value: 'priorityScore' },
      { label: 'Upvotes', value: 'upvotes' },
      { label: 'Submitted By Name', value: (row) => row.createdBy?.name || 'N/A' },
      { label: 'Submitted By Email', value: (row) => row.createdBy?.email || 'N/A' },
      { label: 'Date Created', value: (row) => new Date(row.createdAt).toISOString().split('T')[0] },
      { label: 'Officer Remark', value: 'officerRemark' },
      { label: 'Feedback Rating', value: (row) => row.feedbackRating || 'None' },
      { label: 'Feedback Comment', value: 'feedbackComment' }
    ];

    const csv = parse(complaints, { fields });

    const filename = `complaints_export_${new Date().toISOString().split('T')[0]}.csv`;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.status(200).send(csv);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single complaint by ID
// @route   GET /api/complaints/:id
// @access  Public
const getComplaintById = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id).populate('createdBy', 'name email');

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    res.status(200).json({
      complaint: complaint.toObject({ virtuals: true })
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upvote a complaint
// @route   PATCH /api/complaints/:id/upvote
// @access  Citizen
const upvoteComplaint = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    complaint.upvotes += 1;
    await complaint.save();

    const updatedComplaint = await Complaint.findById(complaint._id).populate('createdBy', 'name email');

    res.status(200).json({
      message: 'Complaint upvoted successfully',
      complaint: updatedComplaint.toObject({ virtuals: true })
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update complaint status & officer remark
// @route   PATCH /api/complaints/:id/status
// @access  Officer
const updateComplaintStatus = async (req, res, next) => {
  try {
    const { status, officerRemark } = req.body;

    if (!status || !['pending', 'in-progress', 'resolved'].includes(status)) {
      return res.status(400).json({ message: 'Invalid or missing status (must be pending, in-progress, or resolved)' });
    }

    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    complaint.status = status;
    if (officerRemark !== undefined) {
      complaint.officerRemark = officerRemark;
    }

    if (status === 'resolved' && !complaint.feedbackGiven) {
      complaint.feedbackPending = true;
    }

    await complaint.save();

    const updatedComplaint = await Complaint.findById(complaint._id).populate('createdBy', 'name email');

    res.status(200).json({
      message: 'Complaint status updated successfully',
      complaint: updatedComplaint.toObject({ virtuals: true })
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit citizen feedback on resolved complaint
// @route   PATCH /api/complaints/:id/feedback
// @access  Citizen (owner only + resolved status only)
const submitFeedback = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be a number between 1 and 5' });
    }

    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    if (complaint.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You are not authorized to submit feedback for this complaint' });
    }

    if (complaint.status !== 'resolved') {
      return res.status(400).json({ message: 'Feedback can only be provided for resolved complaints' });
    }

    complaint.feedbackRating = rating;
    complaint.feedbackComment = comment || '';
    complaint.feedbackGiven = true;
    complaint.feedbackPending = false;

    await complaint.save();

    const updatedComplaint = await Complaint.findById(complaint._id).populate('createdBy', 'name email');

    res.status(200).json({
      message: 'Feedback submitted successfully',
      complaint: updatedComplaint.toObject({ virtuals: true })
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getComplaints,
  createComplaint,
  getMyComplaints,
  exportComplaintsCSV,
  getComplaintById,
  upvoteComplaint,
  updateComplaintStatus,
  submitFeedback
};
