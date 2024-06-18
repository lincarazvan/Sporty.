import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Sports Social Media
        </Typography>
        <Link to="/" style={{ color: 'white', textDecoration: 'none', marginRight: 20 }}>Home</Link>
        <Link to="/followers" style={{ color: 'white', textDecoration: 'none', marginRight: 20 }}>Followers</Link>
        <Link to="/chat" style={{ color: 'white', textDecoration: 'none', marginRight: 20 }}>Chat</Link>
        <Link to="/login" style={{ color: 'white', textDecoration: 'none', marginRight: 20 }}>Login</Link>
        <Link to="/register" style={{ color: 'white', textDecoration: 'none', marginRight: 20 }}>Register</Link>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
