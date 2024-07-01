import React from 'react';
import { Box, List, ListItem, ListItemText, ListItemAvatar, Avatar, TextField, Button, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import { styled } from '@mui/material/styles';

const StyledBox = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    backgroundColor: theme.palette.background.paper,
  }));

const SearchBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

const ConversationList = ({ 
  conversations, 
  searchTerm, 
  setSearchTerm, 
  onSelectConversation, 
  selectedConversationId,
  onNewConversation 
}) => {
  return (
    <StyledBox>
      <SearchBox>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search conversations..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          size="small"
        />
        <Button
          variant="contained"
          color="primary"
          onClick={onNewConversation}
          sx={{ mt: 1, width: '100%' }}
          startIcon={<AddIcon />}
        >
          New Conversation
        </Button>
      </SearchBox>
      <List sx={{ flexGrow: 1, overflow: 'auto' }}>
        {conversations.map((conversation) => (
          <ListItem
            button
            key={conversation.id}
            onClick={() => onSelectConversation(conversation)}
            selected={selectedConversationId === conversation.id}
          >
            <ListItemAvatar>
              <Avatar src={conversation.avatarUrl} alt={conversation.username} />
            </ListItemAvatar>
            <ListItemText 
              primary={conversation.username} 
              secondary={conversation.lastMessage ? conversation.lastMessage.substring(0, 30) + '...' : ''}
            />
          </ListItem>
        ))}
      </List>
    </StyledBox>
  );
};

export default ConversationList;