const express = require('express');
const searchController = require('../controllers/searchController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/', authMiddleware, searchController.search);

module.exports = router;
