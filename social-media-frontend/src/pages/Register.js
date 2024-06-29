import React, { useState, useContext } from 'react';
import { Container, TextField, Button, Typography, Box, Paper, Link } from '@mui/material';
import { styled } from '@mui/material/styles';
import AuthContext from '../context/AuthContext';
import axios from 'axios';
import { Link as RouterLink } from 'react-router-dom';

const StyledPaper = styled(Paper)(({ theme }) => ({
  marginTop: theme.spacing(8),
  padding: theme.spacing(4),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  backgroundColor: 'rgba(255, 255, 255, 0.8)',
}));

const Register = () => {
  const { login } = useContext(AuthContext);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
  
    try {
      const response = await axios.post('http://localhost:3000/api/users/register', {
        username,
        email,
        password
      });
      console.log('Registration successful:', response.data);
      await login(email, password);
    } catch (error) {
      setLoading(false);
      if (error.response) {
        setError(error.response.data.error || 'Registration failed');
      } else if (error.request) {
        setError('No response received from server.');
      } else {
        setError('Registration failed. Please try again.');
      }
      console.error('Registration error:', error);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <StyledPaper elevation={6}>
        <Typography component="h1" variant="h4" gutterBottom>
          Join SPORTY
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}
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
          <Button 
            type="submit" 
            fullWidth 
            variant="contained" 
            color="primary" 
            sx={{ mt: 3, mb: 2 }} 
            disabled={loading}
          >
            {loading ? 'Registering...' : 'Register'}
          </Button>
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Link component={RouterLink} to="/login" variant="body2">
              Already have an account? Sign In
            </Link>
          </Box>
        </Box>
      </StyledPaper>
    </Container>
  );
};

export default Register;