import React from 'react';
import { Box, Typography, TextField, Button, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';
import SendIcon from '@mui/icons-material/Send';
import { format } from 'date-fns';

const StyledBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  backgroundColor: theme.palette.background.default,
}));

const MessageList = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  overflowY: 'auto',
  padding: theme.spacing(2),
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

const ChatSidebar = ({
  selectedConversation,
  messages,
  newMessage,
  setNewMessage,
  onSendMessage,
  onTyping,
  currentUserId,
  isTyping
}) => {
  return (
    <StyledBox>
      {selectedConversation ? (
        <>
          <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
            <Typography variant="h6">
              Chat with {selectedConversation.username}
            </Typography>
          </Box>
          <MessageList>
            {messages.map((message, index) => (
              <MessageBubble
                key={index}
                isCurrentUser={message.senderId === currentUserId}
                elevation={1}
              >
                <Typography variant="body1">{message.content}</Typography>
                <Typography variant="caption" display="block" sx={{ mt: 0.5, textAlign: "right" }}>
                  {format(new Date(message.createdAt), "HH:mm")}
                </Typography>
              </MessageBubble>
            ))}
            {isTyping && (
              <Typography variant="body2" sx={{ fontStyle: "italic", ml: 1 }}>
                {selectedConversation.username} is typing...
              </Typography>
            )}
          </MessageList>
          <InputArea>
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
              onClick={onSendMessage}
              sx={{ ml: 1 }}
            >
              Send
            </Button>
          </InputArea>
        </>
      ) : (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <Typography variant="h6">Select a conversation to start chatting</Typography>
        </Box>
      )}
    </StyledBox>
  );
};

export default ChatSidebar;