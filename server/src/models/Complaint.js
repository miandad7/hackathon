const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['Road', 'Garbage', 'Water', 'Electricity', 'Other']
    },
    area: {
      type: String,
      required: [true, 'Area/Location is required'],
      trim: true
    },
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'resolved'],
      default: 'pending'
    },
    upvotes: {
      type: Number,
      default: 0
    },
    imageUrl: {
      type: String,
      default: null
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    officerRemark: {
      type: String,
      default: ''
    },
    feedbackRating: {
      type: Number,
      min: 1,
      max: 5,
      default: null
    },
    feedbackComment: {
      type: String,
      default: ''
    },
    feedbackGiven: {
      type: Boolean,
      default: false
    },
    feedbackPending: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual getter for priorityScore: upvotes * 2 + daysSinceCreated(createdAt)
complaintSchema.virtual('priorityScore').get(function () {
  const createdAtTime = this.createdAt ? new Date(this.createdAt).getTime() : Date.now();
  const daysSinceCreated = Math.max(0, Math.floor((Date.now() - createdAtTime) / (1000 * 60 * 60 * 24)));
  const upvotes = this.upvotes || 0;
  return upvotes * 2 + daysSinceCreated;
});

// Virtual getter for priority: Low (<5), Medium (5-15), High (16-30), Critical (>30)
complaintSchema.virtual('priority').get(function () {
  const score = this.priorityScore;
  if (score < 5) return 'Low';
  if (score <= 15) return 'Medium';
  if (score <= 30) return 'High';
  return 'Critical';
});

module.exports = mongoose.model('Complaint', complaintSchema);
