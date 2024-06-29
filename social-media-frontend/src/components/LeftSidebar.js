import React, { useContext, useState } from 'react';
import { List, ListItem, ListItemIcon, ListItemText, Avatar, Menu, MenuItem, IconButton } from '@mui/material';
import { Home, Search, Notifications, Mail, Person, ExitToApp, MoreVert } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const LeftSidebar = () => {
  const { user, logout } = useContext(AuthContext);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const menuItems = [
    { text: 'Home', icon: <Home />, link: '/home' },
    { text: 'Search', icon: <Search />, link: '/search' },
    { text: 'Notifications', icon: <Notifications />, link: '/notifications' },
    { text: 'Messages', icon: <Mail />, link: '/messages' },
  ];

  return (
    <List>
      {menuItems.map((item) => (
        <ListItem button key={item.text} component={Link} to={item.link}>
          <ListItemIcon>{item.icon}</ListItemIcon>
          <ListItemText primary={item.text} />
        </ListItem>
      ))}
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
          <Person fontSize="small" style={{marginRight: '10px'}} /> View Profile
        </MenuItem>
        <MenuItem onClick={handleClose} component={Link} to="/edit-profile">
          <Person fontSize="small" style={{marginRight: '10px'}} /> Edit Profile
        </MenuItem>
        <MenuItem onClick={() => { handleClose(); logout(); }}>
          <ExitToApp fontSize="small" style={{marginRight: '10px'}} /> Log out
        </MenuItem>
      </Menu>
    </List>
  );
};

export default LeftSidebar;