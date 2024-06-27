import React, { useState, useContext } from 'react';
import { Container, TextField, Button, Typography, Box } from '@mui/material';
import AuthContext from '../context/AuthContext';

const Register = () => {
  const { login } = useContext(AuthContext); // Folosește login pentru a autentifica utilizatorul după înregistrare
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(''); // Reset error state

    try {
      await login(email, password); // Autentifică utilizatorul după înregistrare
      setLoading(false);
    } catch (error) {
      setLoading(false);
      if (error.response) {
        // Server responded with a status other than 200 range
        console.error('Registration error:', error.response.data);
        setError(error.response.data.error || 'Registration failed');
      } else if (error.request) {
        // Request was made but no response received
        console.error('No response received:', error.request);
        setError('No response received from server.');
      } else {
        // Something else caused the error
        console.error('Error setting up request:', error.message);
        setError('Registration failed. Please try again.');
      }
    }
  };

  return (
    <Container>
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Register
        </Typography>
        {error && <Typography color="error">{error}</Typography>}
        <TextField
          label="Username"
          variant="outlined"
          fullWidth
          margin="normal"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <TextField
          label="Email"
          variant="outlined"
          fullWidth
          margin="normal"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <TextField
          label="Password"
          variant="outlined"
          type="password"
          fullWidth
          margin="normal"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }} disabled={loading}>
          {loading ? 'Registering...' : 'Register'}
        </Button>
      </Box>
    </Container>
  );
};

export default Register;
