import React from 'react';
import { Dialog, DialogTitle, DialogContent, TextField, Button, List, ListItem, ListItemAvatar, ListItemText, Avatar, InputAdornment } from '@mui/material';

const SearchUserDialog = ({
  open,
  onClose,
  searchUserQuery,
  setSearchUserQuery,
  searchUserResults,
  onSearchUser,
  onStartNewConversation
}) => {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Start a new conversation</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Search users"
          type="text"
          fullWidth
          variant="outlined"
          value={searchUserQuery}
          onChange={(e) => setSearchUserQuery(e.target.value)}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <Button onClick={onSearchUser}>Search</Button>
              </InputAdornment>
            ),
          }}
        />
        <List>
          {searchUserResults.map((user) => (
            <ListItem
              button
              key={user.id}
              onClick={() => {
                onStartNewConversation(user);
                onClose();
              }}
            >
              <ListItemAvatar>
                <Avatar src={user.avatarUrl} alt={user.username} />
              </ListItemAvatar>
              <ListItemText primary={user.username} />
            </ListItem>
          ))}
        </List>
      </DialogContent>
    </Dialog>
  );
};

export default SearchUserDialog;