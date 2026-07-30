const mongoose = require('mongoose');

/**
 * Farm equipment maintenance log.
 *
 * The UI for this existed and worked, but was backed entirely by a local
 * `createSampleLogs()` generator plus `localStorage` — so entries were
 * per-browser, invisible to anyone else, and lost when storage was cleared.
 * This is the persistence layer it never had.
 */

const STATUSES = ['Scheduled', 'In Progress', 'Completed', 'Delayed', 'On Hold'];
const PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];

const MaintenanceLogSchema = new mongoose.Schema(
  {
    // Field names deliberately mirror the existing form state so the client
    // rewrite is a persistence swap, not a redesign.
    machine: {
      type: String,
      required: [true, 'Please name the machine or equipment'],
      trim: true,
      maxlength: [150, 'Machine name cannot exceed 150 characters'],
    },
    location: {
      type: String,
      required: [true, 'Please add a location'],
      trim: true,
      maxlength: [150, 'Location cannot exceed 150 characters'],
    },
    task: {
      type: String,
      required: [true, 'Please describe the maintenance task'],
      trim: true,
      maxlength: [1000, 'Task cannot exceed 1000 characters'],
    },
    technician: {
      type: String,
      required: [true, 'Please name the technician'],
      trim: true,
      maxlength: [150, 'Technician name cannot exceed 150 characters'],
    },
    scheduledDate: {
      type: Date,
      required: [true, 'Please add a scheduled date'],
    },
    nextServiceDate: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: STATUSES,
      default: 'Scheduled',
    },
    priority: {
      type: String,
      enum: PRIORITIES,
      default: 'Medium',
    },
    downtimeHours: {
      type: Number,
      min: [0, 'Downtime cannot be negative'],
      max: [10000, 'Downtime looks implausible'],
      default: 0,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [2000, 'Notes cannot exceed 2000 characters'],
      default: '',
    },
    /**
     * Owner scoping. Every query filters on this — a log is private to the user
     * who created it, so one farmer can never see another's equipment schedule.
     */
    owner: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// The list view filters by owner and sorts by scheduled date; the dashboard
// counts by status.
MaintenanceLogSchema.index({ owner: 1, scheduledDate: 1 });
MaintenanceLogSchema.index({ owner: 1, status: 1 });

/** True when a non-complete task's scheduled date has passed. */
MaintenanceLogSchema.virtual('isOverdue').get(function isOverdue() {
  if (this.status === 'Completed') return false;
  if (!this.scheduledDate) return false;
  return this.scheduledDate.getTime() < Date.now();
});

module.exports = mongoose.model('MaintenanceLog', MaintenanceLogSchema);
module.exports.STATUSES = STATUSES;
module.exports.PRIORITIES = PRIORITIES;
