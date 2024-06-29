import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
import {
  Container,
  Box,
  Typography,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  IconButton,
  Paper,
  Divider,
} from "@mui/material";
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
import AuthContext from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import CreatePost from "../components/CreatePost";
import Post from "../components/Post";

const Home = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:3000/api/posts", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPosts(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch posts", error);
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const handleNewPost = (newPost) => {
    setPosts([newPost, ...posts]);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleViewProfile = () => {
    navigate(`/profile/${user.username}`);
  };

  if (loading) {
    return <Typography variant="h6">Loading...</Typography>;
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Grid container spacing={3}>
        {/* Left Sidebar */}
        <Grid item xs={12} md={3}>
          <Paper elevation={3} sx={{ p: 2, position: 'sticky', top: 20 }}>
            <List>
              <ListItem button component={Link} to="/home">
                <ListItemIcon><HomeIcon color="primary" /></ListItemIcon>
                <ListItemText primary="Home" primaryTypographyProps={{ fontWeight: 'bold' }} />
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
              <ListItem button onClick={handleViewProfile}>
                <ListItemIcon><AccountCircleIcon /></ListItemIcon>
                <ListItemText primary="Profile" />
              </ListItem>
              <ListItem button onClick={handleLogout}>
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
                  <IconButton onClick={handleViewProfile}>
                    <MoreVertIcon />
                  </IconButton>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Grid>

        {/* Main Content */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 2, mb: 3 }}>
            <CreatePost onPostCreated={handleNewPost} />
          </Paper>
          <Typography variant="h6" gutterBottom>Latest Posts</Typography>
          {posts.map((post) => (
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

export default Home;