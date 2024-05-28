const { validationResult } = require('express-validator');
const Report = require('../models/report');

exports.createReport = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { reportedUserId, postId, commentId, reason } = req.body;
  try {
    const report = await Report.create({
      userId: req.user.id,
      reportedUserId,
      postId,
      commentId,
      reason,
    });
    res.status(201).send(report);
  } catch (error) {
    res.status(500).send('Server Error');
  }
};

exports.getReports = async (req, res) => {
  try {
    const reports = await Report.findAll({ where: { status: 'pending' } });
    res.send(reports);
  } catch (error) {
    res.status(500).send('Server Error');
  }
};

exports.updateReportStatus = async (req, res) => {
  const { reportId } = req.params;
  const { status } = req.body;
  try {
    const report = await Report.findOne({ where: { id: reportId } });
    if (report) {
      report.status = status;
      await report.save();
      res.send(report);
    } else {
      res.status(404).send('Report not found');
    }
  } catch (error) {
    res.status(500).send('Server Error');
  }
};
