const express = require('express');
const sportsController = require('../controllers/sportsController');
const router = express.Router();

router.get('/live-scores', sportsController.getLiveScores);
router.get('/upcoming-fixtures', sportsController.getUpcomingFixtures);

module.exports = router;