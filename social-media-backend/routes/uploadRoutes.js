const express = require('express');
const upload = require('../config/multerConfig');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/image', authMiddleware.required, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded');
  }
  res.send({ filePath: `/uploads/${req.file.filename}` });
});

module.exports = router;
