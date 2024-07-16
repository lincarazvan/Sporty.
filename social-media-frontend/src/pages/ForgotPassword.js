// În src/pages/ForgotPassword.js
import React, { useState } from 'react';
import { Container, TextField, Button, Typography, Box, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';
import axios from 'axios';

const StyledPaper = styled(Paper)(({ theme }) => ({
  marginTop: theme.spacing(8),
  padding: theme.spacing(4),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  backgroundColor: 'rgba(255, 255, 255, 0.8)',
}));

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const response = await axios.post('http://localhost:3000/api/password/forgot', { email });
      setMessage(response.data.message);
    } catch (error) {
      setError(error.response?.data?.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <StyledPaper elevation={6}>
        <Typography component="h1" variant="h4" gutterBottom>
          Forgot Password
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          {message && <Typography color="primary" sx={{ mb: 2 }}>{message}</Typography>}
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
          <Button 
            type="submit" 
            fullWidth 
            variant="contained" 
            color="primary" 
            sx={{ mt: 3, mb: 2 }} 
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Reset Password'}
          </Button>
        </Box>
      </StyledPaper>
    </Container>
  );
};

export default ForgotPassword;