import React, { useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { Container, TextField, Button, Typography, Box, List, ListItem, ListItemText, Select, MenuItem, InputLabel, FormControl } from '@mui/material';

const socket = io('http://localhost:3000'); // Adaptează URL-ul la serverul tău

const Chat = () => {
  const { user } = useContext(AuthContext);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [users, setUsers] = useState([]);
  const [receiverId, setReceiverId] = useState('');

  useEffect(() => {
    // Obține lista de utilizatori
    axios.get('/api/users')
      .then(response => {
        setUsers(response.data);
      })
      .catch(error => {
        console.error('Error fetching users:', error);
      });

    socket.on('newMessage', (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    socket.on('typing', (senderId) => {
      if (senderId !== user.id) {
        setIsTyping(true);
      }
    });

    socket.on('stopTyping', (senderId) => {
      if (senderId !== user.id) {
        setIsTyping(false);
      }
    });

    return () => {
      socket.off('newMessage');
      socket.off('typing');
      socket.off('stopTyping');
    };
  }, [user.id]);

  const sendMessage = () => {
    if (!receiverId) {
      alert('Please select a user to chat with.');
      return;
    }

    socket.emit('sendMessage', {
      senderId: user.id,
      receiverId,
      content: message,
    });
    setMessage('');
    setTyping(false);
    socket.emit('stopTyping', {
      senderId: user.id,
      receiverId,
    });
  };

  const handleTyping = (e) => {
    setMessage(e.target.value);
    if (!typing) {
      setTyping(true);
      socket.emit('typing', {
        senderId: user.id,
        receiverId,
      });
    }
    if (e.target.value === '') {
      setTyping(false);
      socket.emit('stopTyping', {
        senderId: user.id,
        receiverId,
      });
    }
  };

  return (
    <Container>
      <Typography variant="h4" component="h1" gutterBottom>
        Chat
      </Typography>
      <FormControl fullWidth margin="normal">
        <InputLabel id="select-user-label">Select User to Chat With</InputLabel>
        <Select
          labelId="select-user-label"
          value={receiverId}
          onChange={(e) => setReceiverId(e.target.value)}
        >
          <MenuItem value="">
            <em>Select a user</em>
          </MenuItem>
          {users.map((user) => (
            <MenuItem key={user.id} value={user.id}>
              {user.username}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <List>
        {messages.map((msg, index) => (
          <ListItem key={index}>
            <ListItemText primary={msg.content} secondary={`From: ${msg.senderId}`} />
          </ListItem>
        ))}
      </List>
      {isTyping && <Typography variant="body2" color="textSecondary">Typing...</Typography>}
      <Box sx={{ display: 'flex', mt: 2 }}>
        <TextField
          label="Message"
          variant="outlined"
          fullWidth
          value={message}
          onChange={handleTyping}
          disabled={!receiverId}
        />
        <Button onClick={sendMessage} variant="contained" color="primary" sx={{ ml: 2 }} disabled={!receiverId}>
          Send
        </Button>
      </Box>
    </Container>
  );
};

export default Chat;
