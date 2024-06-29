const express = require('express');
const { check } = require('express-validator');
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/register', [
  check('username', 'Username is required').not().isEmpty(),
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Password is required').isLength({ min: 6 })
], (req, res, next) => {
  console.log('Register route hit'); // Debugging
  next();
}, userController.register);

router.post('/login', [
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Password is required').exists()
], (req, res, next) => {
  console.log('Login route hit'); // Debugging
  next();
}, userController.login);

// Ruta pentru obținerea utilizatorului curent
router.get('/me', authMiddleware.required, userController.getCurrentUser);

// Ruta pentru obținerea tuturor utilizatorilor
router.get('/', authMiddleware.required, userController.getUsers);

// Rute pentru gestionarea profilului utilizatorului
router.get('/profile', authMiddleware.required, userController.profile);
router.put('/profile', authMiddleware.required, userController.updateProfile);
router.delete('/profile', authMiddleware.required, userController.deleteProfile);

router.get('/profile/:username', authMiddleware.required, userController.getUserProfile);

module.exports = router;