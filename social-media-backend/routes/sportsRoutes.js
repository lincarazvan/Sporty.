const express = require('express');
const sportsController = require('../controllers/sportsController');
const router = express.Router();

router.get('/live-scores', sportsController.getLiveScores);
router.get('/upcoming-fixtures', sportsController.getUpcomingFixtures);
router.get('/standings/:leagueId', sportsController.getStandings);
router.get('/match-stats/:matchId', sportsController.getMatchStats);
router.get('/recent-stats/:matchId', sportsController.getRecentStats);
router.get('/top-matches', sportsController.getTopMatches);
router.get('/match-stats/:matchId', sportsController.getMatchStats);
router.get('/recent-stats/:matchId', sportsController.getRecentStats);

module.exports = router;