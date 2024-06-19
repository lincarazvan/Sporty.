import React, { useState, useContext } from 'react';
import { Container, Box, Typography, Button, TextField } from '@mui/material';
import AuthContext from '../context/AuthContext';

const Profile = () => {
  const { user } = useContext(AuthContext);
  const [username, setUsername] = useState(user.username);
  const [email, setEmail] = useState(user.email);
  const [password, setPassword] = useState('');
  const [response, setResponse] = useState('');

  const handleUpdate = async () => {
    try {
      // API call to update profile
      setResponse('Profile updated successfully.');
    } catch (error) {
      setResponse('Error updating profile.');
    }
  };

  return (
    <Container>
      <Box sx={{ mt: 3 }}>
        <Typography variant="h4">Edit Profile</Typography>
        <TextField
          label="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          fullWidth
          margin="normal"
          type="password"
        />
        <Button onClick={handleUpdate} variant="contained" color="primary" sx={{ mt: 2 }}>
          Update Profile
        </Button>
        {response && <Typography sx={{ mt: 2 }}>{response}</Typography>}
      </Box>
    </Container>
  );
};

export default Profile;
