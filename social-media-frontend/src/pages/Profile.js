import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Typography, Avatar, Button, Box, Paper, Container, Grid, List, ListItem, 
  ListItemIcon, ListItemText, IconButton, Divider
} from '@mui/material';
import {
  Home as HomeIcon,
  Search as SearchIcon,
  Notifications as NotificationsIcon,
  Mail as MailIcon,
  AccountCircle as AccountCircleIcon,
  ExitToApp as ExitToAppIcon,
  MoreVert as MoreVertIcon,
  TrendingUp as TrendingUpIcon,
} from "@mui/icons-material";
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import Post from '../components/Post';

const Profile = () => {
  const { username } = useParams();
  const { user, logout } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchProfileAndPosts = async () => {
      try {
        const profileRes = await axios.get(`http://localhost:3000/api/users/profile/${username}`);
        setProfile(profileRes.data);
        const postsRes = await axios.get(`http://localhost:3000/api/posts/user/${profileRes.data.id}`);
        setPosts(postsRes.data);
      } catch (error) {
        console.error('Error fetching profile data:', error);
      }
    };
    fetchProfileAndPosts();
  }, [username]);

  if (!profile) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Grid container spacing={3}>
        {/* Left Sidebar */}
        <Grid item xs={12} md={3}>
          <Paper elevation={3} sx={{ p: 2, position: 'sticky', top: 20 }}>
            <List>
              <ListItem button component={Link} to="/home">
                <ListItemIcon><HomeIcon /></ListItemIcon>
                <ListItemText primary="Home" />
              </ListItem>
              <ListItem button>
                <ListItemIcon><SearchIcon /></ListItemIcon>
                <ListItemText primary="Explore" />
              </ListItem>
              <ListItem button>
                <ListItemIcon><NotificationsIcon /></ListItemIcon>
                <ListItemText primary="Notifications" />
              </ListItem>
              <ListItem button>
                <ListItemIcon><MailIcon /></ListItemIcon>
                <ListItemText primary="Messages" />
              </ListItem>
              <ListItem button selected>
                <ListItemIcon><AccountCircleIcon color="primary" /></ListItemIcon>
                <ListItemText primary="Profile" primaryTypographyProps={{ fontWeight: 'bold' }} />
              </ListItem>
              <ListItem button onClick={logout}>
                <ListItemIcon><ExitToAppIcon /></ListItemIcon>
                <ListItemText primary="Log out" />
              </ListItem>
            </List>
            <Divider sx={{ my: 2 }} />
            <Box>
              <Grid container alignItems="center" spacing={2}>
                <Grid item>
                  <Avatar alt={user?.username} src={user?.avatarUrl ? `http://localhost:3000${user.avatarUrl}` : '/default-avatar.png'} />
                </Grid>
                <Grid item xs>
                  <Typography variant="body1" fontWeight="bold">{user?.username}</Typography>
                  <Typography variant="body2" color="textSecondary">@{user?.username}</Typography>
                </Grid>
                <Grid item>
                  <IconButton>
                    <MoreVertIcon />
                  </IconButton>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Grid>

        {/* Main Content */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
            <Box display="flex" alignItems="center" mb={2}>
              <Avatar
                src={profile.avatarUrl ? `http://localhost:3000${profile.avatarUrl}` : '/default-avatar.png'}
                alt={profile.username}
                sx={{ width: 100, height: 100, mr: 2 }}
              />
              <Box>
                <Typography variant="h5">{profile.username}</Typography>
                <Typography variant="body1" color="textSecondary">@{profile.username}</Typography>
              </Box>
            </Box>
            <Typography variant="body1" paragraph>{profile.bio || 'No bio available'}</Typography>
            {user && user.username === profile.username && (
              <Button variant="outlined" color="primary" component={Link} to="/edit-profile">
                Edit Profile
              </Button>
            )}
          </Paper>
          <Typography variant="h6" gutterBottom>Posts</Typography>
          {posts.map(post => (
            <Post key={post.id} post={post} />
          ))}
        </Grid>

        {/* Right Sidebar */}
        <Grid item xs={12} md={3}>
          <Paper elevation={3} sx={{ p: 2, position: 'sticky', top: 20 }}>
            <Typography variant="h6" gutterBottom>Trends for you</Typography>
            <List>
              {[1, 2, 3, 4, 5].map((item) => (
                <ListItem key={item} button>
                  <ListItemIcon>
                    <TrendingUpIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary={`Trending Topic ${item}`}
                    secondary={`${Math.floor(Math.random() * 10000)} posts`}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Profile;