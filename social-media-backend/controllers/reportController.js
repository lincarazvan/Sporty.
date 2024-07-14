const { Report, User, Post, Comment } = require('../models');

exports.createReport = async (req, res) => {
  const { reportedUserId, postId, commentId, reason } = req.body;
  try {
    const report = await Report.create({
      userId: req.user.id,
      reportedUserId,
      postId,
      commentId,
      reason,
    });
    res.status(201).json(report);
  } catch (error) {
    console.error('Error creating report:', error);
    res.status(500).json({ message: 'Error creating report' });
  }
};

exports.getReports = async (req, res) => {
  try {
    const reports = await Report.findAll({ where: { status: 'pending' } });
    res.json(reports);
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ message: 'Error fetching reports' });
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
    console.error('Error updating report status:', error);
    res.status(500).send('Server Error');
  }
};