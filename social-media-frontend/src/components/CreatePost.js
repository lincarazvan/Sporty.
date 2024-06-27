import React, { useState } from 'react';
import { Box, TextField, Button, IconButton } from '@mui/material';
import { PhotoCamera } from '@mui/icons-material';
import axios from 'axios';

const CreatePost = ({ onPostCreated }) => {
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('content', content);
    if (image) {
      formData.append('image', image);
    }

    try {
      const response = await axios.post('http://localhost:3000/api/posts', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setContent('');
      setImage(null);
      if (onPostCreated) {
        onPostCreated(response.data);
      }
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  return (
    <Box component="form" noValidate autoComplete="off" onSubmit={handleSubmit}>
      <TextField
        label="What's happening?"
        fullWidth
        variant="outlined"
        multiline
        rows={2}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        sx={{ mb: 2 }}
      />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <IconButton color="primary" aria-label="upload picture" component="label">
          <input hidden accept="image/*" type="file" onChange={(e) => setImage(e.target.files[0])} />
          <PhotoCamera />
        </IconButton>
        <Button type="submit" variant="contained" color="primary">
          Post
        </Button>
      </Box>
    </Box>
  );
};

export default CreatePost;