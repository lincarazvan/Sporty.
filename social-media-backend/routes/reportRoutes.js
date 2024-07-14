const express = require('express');
const { check } = require('express-validator');
const reportController = require('../controllers/reportController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/', [
  authMiddleware.required,
  check('reason', 'Reason is required').not().isEmpty(),
], reportController.createReport);

router.get('/', authMiddleware.required, reportController.getReports);

router.put('/:reportId', [
  authMiddleware.required,
  check('status', 'Status is required').not().isEmpty(),
], reportController.updateReportStatus);

module.exports = router;