import React, { useState, useContext } from 'react';
import { Box, Typography, IconButton, TextField, Button, Menu, MenuItem } from '@mui/material';
import { MoreVert, Delete as DeleteIcon } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

const Comment = ({ comment, setComments, comments, setCommentCount }) => {
  const { user } = useContext(AuthContext);
  const [anchorEl, setAnchorEl] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);

  const handleEditComment = async () => {
    try {
      await axios.put(`http://localhost:3000/api/comments/${comment.id}`, { content: editContent }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setComments(comments.map(c => c.id === comment.id ? { ...c, content: editContent } : c));
      setEditMode(false);
    } catch (error) {
      console.error('Error editing comment:', error);
    }
  };

  const handleDeleteComment = async () => {
    try {
      await axios.delete(`http://localhost:3000/api/comments/${comment.id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setComments(comments.filter(c => c.id !== comment.id));
      setCommentCount(prevCount => prevCount - 1);
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  return (
    <Box sx={{ mt: 2, position: 'relative' }}>
      <Typography 
        variant="subtitle2" 
        component={RouterLink} 
        to={`/profile/${comment.User.username}`}
        sx={{ textDecoration: 'none', color: 'inherit', '&:hover': { textDecoration: 'underline' } }}
      >
        {comment.User.username}
      </Typography>
      {editMode ? (
        <Box>
          <TextField
            fullWidth
            multiline
            rows={4}
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            variant="outlined"
          />
          <Button onClick={handleEditComment}>Save</Button>
          <Button onClick={() => setEditMode(false)}>Cancel</Button>
        </Box>
      ) : (
        <Typography variant="body2">{comment.content}</Typography>
      )}
      {user && user.id === comment.userId && (
        <>
          <IconButton
            size="small"
            sx={{ position: 'absolute', top: 0, right: 0 }}
            onClick={(e) => setAnchorEl(e.currentTarget)}
          >
            <MoreVert />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
          >
            <MenuItem onClick={() => { setEditMode(true); setAnchorEl(null); }}>Edit Comment</MenuItem>
            <MenuItem onClick={handleDeleteComment}>Delete Comment</MenuItem>
          </Menu>
        </>
      )}
    </Box>
  );
};

export default Comment;
