const express = require('express');
const { check, validationResult } = require('express-validator');
const privacyController = require('../controllers/privacyController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/', authMiddleware.required, privacyController.getPrivacySettings);
router.post('/', [
  authMiddleware.required,
  check('visibility', 'Visibility is required').isIn(['public', 'friends', 'private'])
], privacyController.updatePrivacySettings);

module.exports = router;
