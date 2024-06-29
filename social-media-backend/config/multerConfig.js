const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Creează directorul 'uploads' dacă nu există
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/avatars/') // Asigurați-vă că acest director există
  },
  filename: function (req, file, cb) {
    cb(null, `avatar-${Date.now()}${path.extname(file.originalname)}`)
  }
});

const upload = multer({ storage: storage });

module.exports = upload;