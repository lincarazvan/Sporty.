require('dotenv').config();
const express = require('express');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const bodyParser = require('body-parser');
const { sequelize } = require('./models'); // Import sequelize from models
const userRoutes = require('./routes/userRoutes');
const postRoutes = require('./routes/postRoutes');
const likeRoutes = require('./routes/likeRoutes');
const commentRoutes = require('./routes/commentRoutes');
const followRoutes = require('./routes/followRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const privacyRoutes = require('./routes/privacyRoutes');
const messageRoutes = require('./routes/messageRoutes');
const passwordRoutes = require('./routes/passwordRoutes');
const reportRoutes = require('./routes/reportRoutes');
const { Server } = require('socket.io');
const Message = require('./models/message');
const Follow = require('./models/follow');
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3001",
    methods: ["GET", "POST"]
  }
});

const corsOptions = {
  origin: 'http://localhost:3001',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};
app.use(cors(corsOptions));
app.use(bodyParser.json());

app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/likes', likeRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/follow', followRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/privacy', privacyRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/password', passwordRoutes);
app.use('/api/reports', reportRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

sequelize.sync().then(() => {
  console.log('Database synced');
  const PORT = process.env.PORT || 3000;
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch(err => console.log(err));

global.io=io;

io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('join', (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined their room`);
  });

  socket.on('sendMessage', (message) => {
    io.to(message.receiverId.toString()).emit('newMessage', message);
  });

  socket.on('typing', (data) => {
    socket.to(data.receiverId.toString()).emit('typing', { senderId: data.senderId });
  });

  socket.on('stopTyping', (data) => {
    socket.to(data.receiverId.toString()).emit('stopTyping', { senderId: data.senderId });
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

module.exports = { io };