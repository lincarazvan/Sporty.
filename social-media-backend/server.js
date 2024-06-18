require('dotenv').config();
const express = require('express');
const http = require('http'); // Import pentru crearea serverului HTTP
const cors = require('cors');
const bodyParser = require('body-parser');
const sequelize = require('./config/database');
const userRoutes = require('./routes/userRoutes');
const postRoutes = require('./routes/postRoutes');
const reactionRoutes = require('./routes/reactionRoutes'); // corectare import duplicat
const commentRoutes = require('./routes/commentRoutes');
const followRoutes = require('./routes/followRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const privacyRoutes = require('./routes/privacyRoutes');
const messageRoutes = require('./routes/messageRoutes');
const passwordRoutes = require('./routes/passwordRoutes');
const reportRoutes = require('./routes/reportRoutes'); // Adăugarea rutei pentru raportare
const { Server } = require('socket.io'); // Import pentru Socket.IO
const Message = require('./models/message'); // Import pentru modelul Message
const Follow = require('./models/follow'); // Import pentru modelul Follow, dacă nu există deja

const app = express();
const server = http.createServer(app); // Creare server HTTP
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3001", // Adaptează la frontend-ul tău
    methods: ["GET", "POST"],
  },
});

const corsOptions = {
  origin: 'http://localhost:3001', // Adaptează la frontend-ul tău
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
app.use('/api/reports', reportRoutes); // Integrarea rutei pentru raportare

sequelize.sync().then(() => console.log('Database synced')).catch(err => console.log(err));

// Gestionarea conexiunilor WebSocket
io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });

  socket.on('sendFollowRequest', async ({ followerId, followingId }) => {
    try {
      const follow = await Follow.create({ followerId, followingId });
      io.to(followingId).emit('newFollowRequest', follow); // Trimite notificare destinatarului
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
        io.to(follow.followerId).emit('followRequestAccepted', follow); // Trimite notificare expeditorului
      }
    } catch (error) {
      console.error('Error accepting follow request:', error);
    }
  });

  socket.on('sendMessage', async ({ senderId, receiverId, content }) => {
    try {
      const message = await Message.create({ senderId, receiverId, content });
      io.to(receiverId).emit('newMessage', message); // Trimite mesajul doar destinatarului
      io.to(senderId).emit('newMessage', message); // Trimite mesajul și expeditorului
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

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
