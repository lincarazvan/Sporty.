const express = require('express');
const { check } = require('express-validator');
const passwordController = require('../controllers/passwordController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/forgot', passwordController.forgotPassword);

router.put('/reset/:token', passwordController.resetPassword);

router.put('/reset/:token', [
  check('password', 'Password is required').isLength({ min: 6 })
], passwordController.resetPassword);

router.put('/change', [
  authMiddleware.required,
  check('currentPassword', 'Current password is required').exists(),
  check('newPassword', 'New password is required').isLength({ min: 6 })
], passwordController.changePassword);

module.exports = router;
