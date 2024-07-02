import React from 'react';
import { Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const MessageButton = ({ userId, username }) => {
  const navigate = useNavigate();

  const handleMessageClick = () => {
    navigate('/chat', { state: { openChat: { id: userId, username } } });
  };

  return (
    <Button
      variant="outlined"
      color="primary"
      onClick={handleMessageClick}
      sx={{ ml: 1 }}
    >
      Message
    </Button>
  );
};

export default MessageButton;