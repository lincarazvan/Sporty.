import React, { useContext, useState, useEffect, useCallback } from 'react';
import { List, ListItem, ListItemIcon, ListItemText, Avatar, Menu, MenuItem, IconButton, Badge } from '@mui/material';
import { Home, Search, Notifications, Mail, Person, ExitToApp, MoreVert } from '@mui/icons-material';
import { Link, useLocation } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import axios from 'axios';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';

const LeftSidebar = () => {
  const { user, logout } = useContext(AuthContext);
  const [anchorEl, setAnchorEl] = useState(null);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const location = useLocation();

  const fetchUnreadNotificationsCount = useCallback(async () => {
    if (user && user.id) {
      try {
        const response = await axios.get('http://localhost:3000/api/notifications/unread-count', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setUnreadNotifications(response.data.count);
      } catch (error) {
        console.error('Error fetching unread notifications count:', error);
      }
    }
  }, [user]);

  useEffect(() => {
    fetchUnreadNotificationsCount();

    if (location.pathname === '/notifications') {
      setUnreadNotifications(0);
    }
  }, [location.pathname, fetchUnreadNotificationsCount]);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const menuItems = [
    { text: 'Home', icon: <Home />, link: '/home' },
    { text: 'Search', icon: <Search />, link: '/search' },
    {
      text: 'Notifications',
      icon:
        <Badge badgeContent={unreadNotifications} color="secondary">
          <Notifications />
        </Badge>,
      link: '/notifications'
    },
    { text: 'Messages', icon: <Mail />, link: '/chat' },
  ];

  return (
    <List>
      {menuItems.map((item) => (
        <ListItem button key={item.text} component={Link} to={item.link}>
          <ListItemIcon>{item.icon}</ListItemIcon>
          <ListItemText primary={item.text} />
        </ListItem>
      ))}
      {user && user.isAdmin && (
        <ListItem button component={Link} to="/admin">
          <ListItemIcon><AdminPanelSettingsIcon /></ListItemIcon>
          <ListItemText primary="Admin Panel" />
        </ListItem>
      )}
      <ListItem>
        <ListItemIcon>
          <Avatar src={user.avatarUrl} alt={user.username} />
        </ListItemIcon>
        <ListItemText primary={user.username} secondary={`@${user.username}`} />
        <IconButton onClick={handleClick}>
          <MoreVert />
        </IconButton>
      </ListItem>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <MenuItem onClick={handleClose} component={Link} to={`/profile/${user.username}`}>
          <Person fontSize="small" style={{ marginRight: '10px' }} /> View Profile
        </MenuItem>
        <MenuItem onClick={handleClose} component={Link} to="/edit-profile">
          <Person fontSize="small" style={{ marginRight: '10px' }} /> Edit Profile
        </MenuItem>
        <MenuItem onClick={() => { handleClose(); logout(); }}>
          <ExitToApp fontSize="small" style={{ marginRight: '10px' }} /> Log out
        </MenuItem>
      </Menu>
    </List>
  );
};

export default LeftSidebar;