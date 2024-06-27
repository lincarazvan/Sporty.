import React, { useState } from 'react';
import { Box, TextField, Button, IconButton, Typography } from '@mui/material';
import { PhotoCamera, Cancel } from '@mui/icons-material';
import axios from 'axios';

const CreatePost = ({ onPostCreated }) => {
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setImage(null);
    setPreviewUrl(null);
  };

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
      setPreviewUrl(null);
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <IconButton color="primary" aria-label="upload picture" component="label">
          <input hidden accept="image/*" type="file" onChange={handleImageChange} />
          <PhotoCamera />
        </IconButton>
        <Button type="submit" variant="contained" color="primary">
          Post
        </Button>
      </Box>
      {previewUrl && (
        <Box sx={{ position: 'relative', mb: 2 }}>
          <img src={previewUrl} alt="Preview" style={{ maxWidth: '100%', maxHeight: '200px' }} />
          <IconButton
            sx={{ position: 'absolute', top: 0, right: 0, color: 'white', backgroundColor: 'rgba(0,0,0,0.5)' }}
            onClick={removeImage}
          >
            <Cancel />
          </IconButton>
        </Box>
      )}
      {image && <Typography variant="caption">Image selected: {image.name}</Typography>}
    </Box>
  );
};

export default CreatePost;