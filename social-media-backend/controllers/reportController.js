const { Report, User, Post} = require('../models');

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
    const reports = await Report.findAll({
      where: { status: 'pending' },
      include: [
        { model: User, as: 'Reporter', attributes: ['id', 'username'] },
        { model: User, as: 'ReportedUser', attributes: ['id', 'username'] },
        { model: Post, attributes: ['id', 'content'] }
      ]
    });
    console.log("Reports fetched:", JSON.stringify(reports, null, 2));
    res.json(reports);
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ message: 'Error fetching reports', error: error.message });
  }
};

exports.updateReportStatus = async (req, res) => {
  const { reportId } = req.params;
  const { status } = req.body;
  try {
    const report = await Report.findOne({ where: { id: reportId } });
    if (report) {
      if (status === 'resolved') {
        await report.destroy();
        res.json({ message: 'Report resolved and deleted' });
      } else {
        report.status = status;
        await report.save();
        res.json(report);
      }
    } else {
      res.status(404).send('Report not found');
    }
  } catch (error) {
    console.error('Error updating report status:', error);
    res.status(500).send('Server Error');
  }
};