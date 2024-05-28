import React, { useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

const socket = io('http://localhost:3000'); // Adaptează URL-ul la serverul tău

const Chat = () => {
  const { user } = useContext(AuthContext);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [users, setUsers] = useState([]);
  const [receiverId, setReceiverId] = useState(null);

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
  }, [user]);

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
    <div>
      <h2>Chat</h2>
      <div>
        <label>Select User to Chat With: </label>
        <select onChange={(e) => setReceiverId(e.target.value)} value={receiverId}>
          <option value="">Select a user</option>
          {users.map(user => (
            <option key={user.id} value={user.id}>{user.username}</option>
          ))}
        </select>
      </div>
      <div>
        {messages.map((msg, index) => (
          <div key={index}>
            <strong>{msg.senderId}</strong>: {msg.content}
          </div>
        ))}
      </div>
      {isTyping && <div>Typing...</div>}
      <input
        type="text"
        value={message}
        onChange={handleTyping}
        disabled={!receiverId}
      />
      <button onClick={sendMessage} disabled={!receiverId}>Send</button>
    </div>
  );
};

export default Chat;
