import React, { useContext } from 'react';
import { List, ListItem, ListItemIcon, ListItemText, Paper } from '@mui/material';
import { Home, Person, ExitToApp } from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const Sidebar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Paper elevation={3}>
      <List>
        <ListItem button component={Link} to="/home">
          <ListItemIcon><Home /></ListItemIcon>
          <ListItemText primary="Home" />
        </ListItem>
        <ListItem button component={Link} to={`/profile/${user?.username}`}>
          <ListItemIcon><Person /></ListItemIcon>
          <ListItemText primary="Profile" />
        </ListItem>
        <ListItem button onClick={handleLogout}>
          <ListItemIcon><ExitToApp /></ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItem>
      </List>
    </Paper>
  );
};

export default Sidebar;