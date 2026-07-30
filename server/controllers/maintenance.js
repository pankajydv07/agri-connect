/**
 * Farm equipment maintenance logs.
 *
 * Every query is scoped to `owner: req.user.id`, so a log is private to the user
 * who created it. There is no cross-user read path by design — equipment
 * schedules reveal operational detail about a farm.
 */

const MaintenanceLog = require('../models/MaintenanceLog');
const { AppError, asyncHandler } = require('../middleware/errorHandler');

const WRITABLE_FIELDS = [
  'machine',
  'location',
  'task',
  'technician',
  'scheduledDate',
  'nextServiceDate',
  'status',
  'priority',
  'downtimeHours',
  'notes',
];

// Same allow-list discipline as products: `owner` is never writable from a
// request body, only derived from the token.
const pickWritable = (body) =>
  WRITABLE_FIELDS.reduce((acc, field) => {
    if (body[field] !== undefined) acc[field] = body[field];
    return acc;
  }, {});

// @desc    List the current user's maintenance logs
// @route   GET /api/maintenance-logs
// @access  Private
exports.getLogs = asyncHandler(async (req, res) => {
  const { page, limit, status, priority, search, sort } = req.query;

  const filter = { owner: req.user.id };
  if (status) filter.status = status;
  if (priority) filter.priority = priority;

  if (search) {
    // Escape regex metacharacters so a crafted search can't build a pathological pattern.
    const safe = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = new RegExp(safe, 'i');
    filter.$or = [{ machine: pattern }, { task: pattern }, { technician: pattern }, { location: pattern }];
  }

  const sortBy = sort === 'desc' ? '-scheduledDate' : 'scheduledDate';
  const skip = (page - 1) * limit;

  const [logs, total, statusCounts] = await Promise.all([
    MaintenanceLog.find(filter).sort(sortBy).skip(skip).limit(limit),
    MaintenanceLog.countDocuments(filter),
    // Powers the summary tiles without a second round trip per status.
    MaintenanceLog.aggregate([
      { $match: { owner: req.user._id } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
  ]);

  res.status(200).json({
    success: true,
    count: logs.length,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
      hasNext: skip + logs.length < total,
      hasPrev: page > 1,
    },
    // `toJSON` includes the isOverdue virtual.
    data: logs,
    summary: statusCounts.reduce((acc, row) => ({ ...acc, [row._id]: row.count }), {}),
  });
});

// @desc    Get a single maintenance log
// @route   GET /api/maintenance-logs/:id
// @access  Private (owner only)
exports.getLog = asyncHandler(async (req, res) => {
  const log = await MaintenanceLog.findOne({ _id: req.params.id, owner: req.user.id });

  // Filtering by owner in the query rather than fetching then comparing means a
  // non-owner gets an indistinguishable 404 — no confirmation the id exists.
  if (!log) {
    throw new AppError('Maintenance log not found', 404);
  }

  res.status(200).json({ success: true, data: log });
});

// @desc    Create a maintenance log
// @route   POST /api/maintenance-logs
// @access  Private
exports.createLog = asyncHandler(async (req, res) => {
  const payload = pickWritable(req.body);
  payload.owner = req.user.id;

  const log = await MaintenanceLog.create(payload);

  res.status(201).json({ success: true, data: log });
});

// @desc    Update a maintenance log
// @route   PATCH /api/maintenance-logs/:id
// @access  Private (owner only)
exports.updateLog = asyncHandler(async (req, res) => {
  const updates = pickWritable(req.body);

  const log = await MaintenanceLog.findOneAndUpdate(
    { _id: req.params.id, owner: req.user.id },
    updates,
    { new: true, runValidators: true }
  );

  if (!log) {
    throw new AppError('Maintenance log not found', 404);
  }

  res.status(200).json({ success: true, data: log });
});

// @desc    Delete a maintenance log
// @route   DELETE /api/maintenance-logs/:id
// @access  Private (owner only)
exports.deleteLog = asyncHandler(async (req, res) => {
  const log = await MaintenanceLog.findOneAndDelete({ _id: req.params.id, owner: req.user.id });

  if (!log) {
    throw new AppError('Maintenance log not found', 404);
  }

  res.status(200).json({ success: true, data: {} });
});

// @desc    Delete all of the current user's logs
// @route   DELETE /api/maintenance-logs
// @access  Private
exports.clearLogs = asyncHandler(async (req, res) => {
  // Replaces the old client-side "Clear Logbook" button, which wiped
  // localStorage. Scoped to the owner so it can never affect anyone else.
  const { deletedCount } = await MaintenanceLog.deleteMany({ owner: req.user.id });

  res.status(200).json({ success: true, data: { deletedCount } });
});
