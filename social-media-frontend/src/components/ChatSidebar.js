import React, { useState, useRef, useEffect } from 'react';
import { Box, Typography, TextField, Button, Paper, Avatar, IconButton, Menu, MenuItem } from '@mui/material';
import { styled } from '@mui/material/styles';
import SendIcon from '@mui/icons-material/Send';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { format, isToday, isYesterday, isSameDay } from 'date-fns';
import { Link } from 'react-router-dom';
import EmojiPicker from 'emoji-picker-react';

const StyledBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  width: '100%',
  backgroundColor: theme.palette.background.default,
}));

const MessageList = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  overflowY: 'auto',
  padding: theme.spacing(2),
  display: 'flex',
  flexDirection: 'column',
}));

const MessageBubble = styled(Paper)(({ theme, isCurrentUser }) => ({
  padding: theme.spacing(1, 2),
  marginBottom: theme.spacing(1),
  maxWidth: '70%',
  alignSelf: isCurrentUser ? 'flex-end' : 'flex-start',
  backgroundColor: isCurrentUser ? theme.palette.primary.light : theme.palette.grey[200],
  color: isCurrentUser ? theme.palette.primary.contrastText : theme.palette.text.primary,
}));

const InputArea = styled(Box)(({ theme }) => ({
  display: 'flex',
  padding: theme.spacing(2),
  borderTop: `1px solid ${theme.palette.divider}`,
}));

const ChatHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(2),
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

const DateDivider = styled(Typography)(({ theme }) => ({
  textAlign: 'center',
  margin: theme.spacing(2, 0),
  color: theme.palette.text.secondary,
}));

const ChatSidebar = ({
  selectedConversation,
  messages,
  newMessage,
  setNewMessage,
  onSendMessage,
  onTyping,
  currentUserId,
  isTyping,
  onDeleteMessage,
  onBackToList
}) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [attachedImage, setAttachedImage] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => { scrollToBottom(); }, [messages]);

  const handleEmojiClick = (emojiObject) => {
    setNewMessage(prevMessage => prevMessage + emojiObject.emoji);
    setShowEmojiPicker(false);
  };

  const handleMenuOpen = (event, message) => {
    setAnchorEl(event.currentTarget);
    setSelectedMessage(message);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedMessage(null);
  };

  const handleDeleteMessage = () => {
    if (selectedMessage) {
      onDeleteMessage(selectedMessage.id);
    }
    handleMenuClose();
  };

  const groupMessagesByDate = (messages) => {
    const groups = [];
    let currentGroup = [];
    let currentDate = null;

    messages.forEach((message) => {
      const messageDate = new Date(message.createdAt);
      if (!currentDate || !isSameDay(currentDate, messageDate)) {
        if (currentGroup.length > 0) {
          groups.push({ date: currentDate, messages: currentGroup });
        }
        currentGroup = [message];
        currentDate = messageDate;
      } else {
        currentGroup.push(message);
      }
    });

    if (currentGroup.length > 0) {
      groups.push({ date: currentDate, messages: currentGroup });
    }

    return groups;
  };

  const formatMessageDate = (date) => {
    if (isToday(date)) {
      return 'Today';
    } else if (isYesterday(date)) {
      return 'Yesterday';
    } else {
      return format(date, 'MMMM d, yyyy');
    }
  };

  const groupedMessages = groupMessagesByDate(messages);

  const handleSendMessage = () => {
    if (newMessage.trim() || attachedImage) {
      onSendMessage(newMessage, attachedImage);
      setNewMessage('');
      setAttachedImage(null);
    }
  };

  return (
    <StyledBox>
      {selectedConversation ? (
        <>
          <ChatHeader>
            <IconButton onClick={onBackToList} edge="start">
              <ArrowBackIcon />
            </IconButton>
            <Avatar 
              src={selectedConversation.avatarUrl} 
              alt={selectedConversation.username}
              sx={{ width: 40, height: 40, mr: 2 }}
            />
            <Typography variant="h6" component={Link} to={`/profile/${selectedConversation.username}`} sx={{ textDecoration: 'none', color: 'inherit' }}>
              {selectedConversation.username}
            </Typography>
          </ChatHeader>
          <MessageList>
            {groupedMessages.map((group, groupIndex) => (
              <React.Fragment key={groupIndex}>
                <DateDivider>{formatMessageDate(group.date)}</DateDivider>
                {group.messages.map((message, index) => (
                  <MessageBubble
                    key={index}
                    isCurrentUser={message.senderId === currentUserId}
                    elevation={1}
                  >
                    {message.isDeleted ? (
                      <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                        This message has been deleted
                      </Typography>
                    ) : (
                      <>
                        <Typography variant="body1">{message.content}</Typography>
                        {message.image && <img src={message.image} alt="Attached" style={{ maxWidth: '100%', marginTop: '8px' }} />}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5 }}>
                          <Typography variant="caption">
                            {format(new Date(message.createdAt), "HH:mm")}
                          </Typography>
                          {message.senderId === currentUserId && (
                            <IconButton size="small" onClick={(e) => handleMenuOpen(e, message)}>
                              <MoreVertIcon fontSize="small" />
                            </IconButton>
                          )}
                        </Box>
                      </>
                    )}
                  </MessageBubble>
                ))}
              </React.Fragment>
            ))}
            <div ref={messagesEndRef} />
            {isTyping && (
              <Typography variant="body2" sx={{ fontStyle: "italic", ml: 1 }}>
                {selectedConversation.username} is typing...
              </Typography>
            )}
          </MessageList>
          <InputArea>
            <IconButton onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
              <EmojiEmotionsIcon />
            </IconButton>
            
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value);
                onTyping(e);
              }}
              size="small"
            />
            <Button
              variant="contained"
              color="primary"
              endIcon={<SendIcon />}
              onClick={handleSendMessage}
              sx={{ ml: 1 }}
            >
              Send
            </Button>
          </InputArea>
          {attachedImage && (
            <Box sx={{ p: 1, borderTop: '1px solid #ccc' }}>
              <img src={attachedImage} alt="Attached" style={{ maxWidth: '100px', maxHeight: '100px' }} />
            </Box>
          )}
          {showEmojiPicker && (
            <Box sx={{ position: 'absolute', bottom: '80px', left: '20px', zIndex: 1 }}>
              <EmojiPicker onEmojiClick={handleEmojiClick} />
            </Box>
          )}
        </>
      ) : (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <Typography variant="h6">Select a conversation to start chatting</Typography>
        </Box>
      )}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleDeleteMessage}>Delete</MenuItem>
      </Menu>
    </StyledBox>
  );
};

export default ChatSidebar;
