import React, { useState, useContext } from 'react';
import { Container, TextField, Button, Typography } from '@mui/material';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

const EditProfile = () => {
  const { user, setUser } = useContext(AuthContext);
  const [username, setUsername] = useState(user.username);
  const [bio, setBio] = useState(user.bio || '');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put('http://localhost:3000/api/users/profile', 
        { username, bio },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setUser(response.data);
      // Redirect to profile page or show success message
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  return (
    <Container>
      <Typography variant="h4" sx={{ mb: 4 }}>Edit Profile</Typography>
      <form onSubmit={handleSubmit}>
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
        <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>
          Save Changes
        </Button>
      </form>
    </Container>
  );
};

export default EditProfile;