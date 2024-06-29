import React, { useState, useEffect, useContext } from 'react';
import { Container, TextField, Button, Typography, Box, Avatar, Paper, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const EditProfile = () => {
  const { user, setUser } = useContext(AuthContext);
  const [username, setUsername] = useState(user ? user.username : '');
  const [bio, setBio] = useState(user ? user.bio || '' : '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(user ? `http://localhost:3000${user.avatarUrl}` : '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      setUsername(user.username);
      setBio(user.bio || '');
      setAvatarPreview(user.avatarUrl ? `http://localhost:3000${user.avatarUrl}` : '');
    }
  }, [user]);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    setAvatar(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('username', username);
    formData.append('bio', bio);
    if (currentPassword) formData.append('currentPassword', currentPassword);
    if (newPassword) formData.append('newPassword', newPassword);
    if (avatar) formData.append('avatar', avatar);

    try {
      const response = await axios.put('http://localhost:3000/api/users/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setUser(response.data);
      localStorage.setItem('user', JSON.stringify(response.data));
      
      navigate(`/profile/${response.data.username}`);
    } catch (error) {
      console.error('Error updating profile:', error);
      console.error('Error response:', error.response);
      setError(error.response?.data?.message || 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" sx={{ mb: 4, textAlign: 'center' }}>Edit Profile</Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Avatar
            src={avatarPreview}
            alt={username}
            sx={{ width: 100, height: 100, mb: 2 }}
          />
          <input
            accept="image/*"
            type="file"
            id="avatar-upload"
            style={{ display: 'none' }}
            onChange={handleAvatarChange}
          />
          <label htmlFor="avatar-upload">
            <Button variant="contained" component="span" sx={{ mb: 2 }}>
              Change Avatar
            </Button>
          </label>
          <TextField
            fullWidth
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            margin="normal"
            multiline
            rows={4}
          />
          <Accordion sx={{ width: '100%', mt: 2 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>Update Password</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <TextField
                fullWidth
                label="Current Password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                margin="normal"
              />
              <TextField
                fullWidth
                label="New Password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                margin="normal"
              />
            </AccordionDetails>
          </Accordion>
          {error && <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>}
          <Button type="submit" variant="contained" color="primary" sx={{ mt: 3 }} disabled={loading}>
            {loading ? 'Updating...' : 'Save Changes'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default EditProfile;