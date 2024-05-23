const express = require('express');
const { check, validationResult } = require('express-validator');
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/register', [
  check('username', 'Username is required').not().isEmpty(),
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Password must be 6 or more characters').isLength({ min: 6 })
], userController.register);

router.post('/login', [
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Password is required').exists()
], userController.login);

router.get('/profile', authMiddleware, userController.profile);

router.delete('/profile', authMiddleware, userController.deleteProfile);

router.put('/profile', [
    authMiddleware,
    check('username', 'Username is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail()
  ], userController.updateProfile);

module.exports = router;
