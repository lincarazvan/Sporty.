require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const bodyParser = require('body-parser');
const { sequelize } = require('./models'); // Import sequelize from models
const userRoutes = require('./routes/userRoutes');
const postRoutes = require('./routes/postRoutes');
const reactionRoutes = require('./routes/reactionRoutes');
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
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3001",
    methods: ["GET", "POST"],
  },
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
app.use('/api/reactions', reactionRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/follows', followRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/privacy', privacyRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/password', passwordRoutes);
app.use('/api/reports', reportRoutes);

// Nu folosim force: true în sincronizare
sequelize.sync().then(() => {
  console.log('Database synced');
  const PORT = process.env.PORT || 3000;
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch(err => console.log(err));

io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });

  socket.on('sendFollowRequest', async ({ followerId, followingId }) => {
    try {
      const follow = await Follow.create({ followerId, followingId });
      io.to(followingId).emit('newFollowRequest', follow);
    } catch (error) {
      console.error('Error sending follow request:', error);
    }
  });

  socket.on('acceptFollowRequest', async ({ followId }) => {
    try {
      const follow = await Follow.findOne({ where: { id: followId, status: 'pending' } });
      if (follow) {
        follow.status = 'accepted';
        await follow.save();
        io.to(follow.followerId).emit('followRequestAccepted', follow);
      }
    } catch (error) {
      console.error('Error accepting follow request:', error);
    }
  });

  socket.on('sendMessage', async ({ senderId, receiverId, content }) => {
    try {
      const message = await Message.create({ senderId, receiverId, content });
      io.to(receiverId).emit('newMessage', message);
      io.to(senderId).emit('newMessage', message);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  });

  socket.on('typing', ({ senderId, receiverId }) => {
    io.to(receiverId).emit('typing', senderId);
  });

  socket.on('stopTyping', ({ senderId, receiverId }) => {
    io.to(receiverId).emit('stopTyping', senderId);
  });
});
