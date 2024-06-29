import React, { useState, useContext } from 'react';
import { Container, TextField, Button, Typography, Box, Paper, Link } from '@mui/material';
import { styled } from '@mui/material/styles';
import AuthContext from '../context/AuthContext';
import { Link as RouterLink } from 'react-router-dom';

const StyledPaper = styled(Paper)(({ theme }) => ({
  marginTop: theme.spacing(8),
  padding: theme.spacing(4),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  backgroundColor: 'rgba(255, 255, 255, 0.8)',
}));

const Login = () => {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, password);
    } catch (error) {
      setLoading(false);
      console.error('Login error:', error);
      setError('Login failed. Please try again.');
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <StyledPaper elevation={6}>
        <Typography component="h1" variant="h4" gutterBottom>
          Login to SPORTY
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}
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
            {loading ? 'Logging in...' : 'Login'}
          </Button>
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Link component={RouterLink} to="/register" variant="body2">
              Don't have an account? Sign Up
            </Link>
          </Box>
        </Box>
      </StyledPaper>
    </Container>
  );
};

export default Login;