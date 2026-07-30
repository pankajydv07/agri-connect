const express = require('express');
const {
  getLogs,
  getLog,
  createLog,
  updateLog,
  deleteLog,
  clearLogs,
} = require('../controllers/maintenance');
const { protect } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validate');

const router = express.Router();

// Every route is owner-scoped in the controller, so no role gate is needed —
// any authenticated user keeps their own equipment logbook.
router.use(protect);

router
  .route('/')
  .get(validate(schemas.maintenanceListQuery, 'query'), getLogs)
  .post(validate(schemas.createMaintenanceLog), createLog)
  .delete(clearLogs);

router
  .route('/:id')
  .get(validate(schemas.idParam, 'params'), getLog)
  .patch(
    validate(schemas.idParam, 'params'),
    validate(schemas.updateMaintenanceLog),
    updateLog
  )
  .delete(validate(schemas.idParam, 'params'), deleteLog);

module.exports = router;
