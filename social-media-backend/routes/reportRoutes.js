const express = require('express');
const { check } = require('express-validator');
const reportController = require('../controllers/reportController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/', [
  authMiddleware,
  check('reason', 'Reason is required').not().isEmpty(),
], reportController.createReport);

router.get('/', authMiddleware, reportController.getReports);

router.put('/:reportId', [
  authMiddleware,
  check('status', 'Status is required').not().isEmpty(),
], reportController.updateReportStatus);

module.exports = router;
