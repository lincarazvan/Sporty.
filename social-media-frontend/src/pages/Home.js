import React, { useState, useContext } from 'react';
import { Container, Box, Typography, Button, TextField, Grid, List, ListItem, ListItemIcon, ListItemText, Avatar, IconButton } from '@mui/material';
import { Home as HomeIcon, Search as SearchIcon, Notifications as NotificationsIcon, Mail as MailIcon, AccountCircle as AccountCircleIcon, ExitToApp as ExitToAppIcon, MoreVert as MoreVertIcon } from '@mui/icons-material';
import AuthContext from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleEditProfile = () => {
    navigate('/profile');
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Grid container spacing={2}>
        {/* Sidebar */}
        <Grid item xs={3} sx={{ borderRight: '1px solid #e0e0e0', pr: 2, position: 'relative', height: '100vh' }}>
          <List>
            <ListItem button>
              <ListItemIcon>
                <HomeIcon />
              </ListItemIcon>
              <ListItemText primary="Home" />
            </ListItem>
            <ListItem button>
              <ListItemIcon>
                <SearchIcon />
              </ListItemIcon>
              <ListItemText primary="Explore" />
            </ListItem>
            <ListItem button>
              <ListItemIcon>
                <NotificationsIcon />
              </ListItemIcon>
              <ListItemText primary="Notifications" />
            </ListItem>
            <ListItem button>
              <ListItemIcon>
                <MailIcon />
              </ListItemIcon>
              <ListItemText primary="Messages" />
            </ListItem>
            <ListItem button onClick={handleEditProfile}>
              <ListItemIcon>
                <AccountCircleIcon />
              </ListItemIcon>
              <ListItemText primary="Profile" />
            </ListItem>
            <ListItem button onClick={handleLogout}>
              <ListItemIcon>
                <ExitToAppIcon />
              </ListItemIcon>
              <ListItemText primary="Log out" />
            </ListItem>
          </List>
          {/* Profile Section */}
          <Box position="absolute" bottom={0} p={2} width="100%">
            <Grid container alignItems="center" spacing={1}>
              <Grid item>
                <Avatar alt={user?.username} src="/path/to/avatar.jpg" />
              </Grid>
              <Grid item xs>
                <Typography variant="body1">{user?.username}</Typography>
                <Typography variant="body2" color="textSecondary">@{user?.username}</Typography>
              </Grid>
              <Grid item>
                <IconButton onClick={handleEditProfile}>
                  <MoreVertIcon />
                </IconButton>
              </Grid>
            </Grid>
          </Box>
        </Grid>
        {/* Main Content */}
        <Grid item xs={6} sx={{ borderRight: '1px solid #e0e0e0', paddingTop: 2 }}>
          <Box component="form" noValidate autoComplete="off">
            <TextField
              label="What's happening?"
              fullWidth
              variant="outlined"
              multiline
              rows={3}
              sx={{ mb: 2 }}
            />
            <Button variant="contained" color="primary">Post</Button>
          </Box>
          <Box mt={4}>
            <Typography variant="h6">Posts</Typography>
            {/* Render posts here */}
          </Box>
        </Grid>
        {/* Right Sidebar */}
        <Grid item xs={3}>
          <Typography variant="h6">Trends for you</Typography>
          {/* Render trends here */}
        </Grid>
      </Grid>
    </Container>
  );
};

export default Home;
