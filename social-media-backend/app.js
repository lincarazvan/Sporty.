require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const sequelize = require('./config/database'); // Importă sequelize
const userRoutes = require('./routes/userRoutes');
const postRoutes = require('./routes/postRoutes');
const reactionRoutes = require('./routes/reactionRoutes');
const commentRoutes = require('./routes/commentRoutes');
const followRoutes = require('./routes/followRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const privacyRoutes = require('./routes/privacyRoutes');

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/reactions', reactionRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/follows', followRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/privacy', privacyRoutes);

// Sincronizează baza de date
sequelize.sync().then(() => console.log('Database synced')).catch(err => console.log(err));

module.exports = app;
