import React, { useState, useEffect, useContext } from 'react';
import { Container, Paper, List, ListItem, ListItemText, ListItemAvatar, Avatar, Typography, Grid, TextField, Button, Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import AuthContext from '../context/AuthContext';
import axios from 'axios';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  height: 'calc(100vh - 100px)',
  overflow: 'hidden',
}));

const ChatContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  height: '100%',
}));

const ConversationList = styled(Box)(({ theme }) => ({
  width: '300px',
  borderRight: `1px solid ${theme.palette.divider}`,
  overflowY: 'auto',
}));

const ChatArea = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  display: 'flex',
  flexDirection: 'column',
  padding: theme.spacing(2),
}));

const MessageList = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  overflowY: 'auto',
  marginBottom: theme.spacing(2),
}));

const ChatPage = () => {
  const { user } = useContext(AuthContext);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/messages/conversations', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setConversations(response.data);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
    fetchMessages(conversation.id);
  };

  const fetchMessages = async (otherUserId) => {
    try {
      const response = await axios.get(`http://localhost:3000/api/messages/${otherUserId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      await axios.post('http://localhost:3000/api/messages', {
        receiverId: selectedConversation.id,
        content: newMessage
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setNewMessage('');
      fetchMessages(selectedConversation.id);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <Container maxWidth="lg">
      <StyledPaper>
        <ChatContainer>
          <ConversationList>
            <Typography variant="h6" sx={{ p: 2 }}>Conversations</Typography>
            <List>
              {conversations.map((conversation) => (
                <ListItem 
                  button 
                  key={conversation.id}
                  onClick={() => handleSelectConversation(conversation)}
                  selected={selectedConversation && selectedConversation.id === conversation.id}
                >
                  <ListItemAvatar>
                    <Avatar src={conversation.avatarUrl} alt={conversation.username} />
                  </ListItemAvatar>
                  <ListItemText primary={conversation.username} />
                </ListItem>
              ))}
            </List>
          </ConversationList>
          
          {selectedConversation ? (
            <ChatArea>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Chat with {selectedConversation.username}
              </Typography>
              <MessageList>
                {messages.map((message, index) => (
                  <Box key={index} sx={{ mb: 1, textAlign: message.senderId === user.id ? 'right' : 'left' }}>
                    <Typography variant="body2" sx={{ backgroundColor: message.senderId === user.id ? '#e3f2fd' : '#f5f5f5', p: 1, borderRadius: 1, display: 'inline-block' }}>
                      {message.content}
                    </Typography>
                  </Box>
                ))}
              </MessageList>
              <Grid container spacing={2}>
                <Grid item xs={10}>
                  <TextField
                    fullWidth
                    variant="outlined"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                  />
                </Grid>
                <Grid item xs={2}>
                  <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    onClick={handleSendMessage}
                  >
                    Send
                  </Button>
                </Grid>
              </Grid>
            </ChatArea>
          ) : (
            <ChatArea>
              <Typography variant="h6">Select a conversation to start chatting</Typography>
            </ChatArea>
          )}
        </ChatContainer>
      </StyledPaper>
    </Container>
  );
};

export default ChatPage;