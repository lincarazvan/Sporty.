const express = require('express');
const { check } = require('express-validator');
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

// Ruta pentru înregistrare
router.post('/register', [
  check('username', 'Username is required').not().isEmpty(),
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Password is required').isLength({ min: 6 })
], userController.register);

// Ruta pentru login
router.post('/login', [
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Password is required').exists()
], userController.login);

// Ruta pentru obținerea utilizatorului curent
router.get('/me', authMiddleware, userController.getCurrentUser);

// Ruta pentru obținerea tuturor utilizatorilor
router.get('/', authMiddleware, userController.getUsers);

// Rute pentru gestionarea profilului utilizatorului
router.get('/profile', authMiddleware, userController.profile);
router.put('/profile', [
  authMiddleware,
  check('username', 'Username is required').not().isEmpty(),
  check('email', 'Please include a valid email').isEmail()
], userController.updateProfile);
router.delete('/profile', authMiddleware, userController.deleteProfile);

module.exports = router;
