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
} from "@mui/material";
import {
  Home as HomeIcon,
  Search as SearchIcon,
  Notifications as NotificationsIcon,
  Mail as MailIcon,
  AccountCircle as AccountCircleIcon,
  ExitToApp as ExitToAppIcon,
  MoreVert as MoreVertIcon,
} from "@mui/icons-material";
import AuthContext from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
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

  const handleEditProfile = () => {
    navigate("/profile");
  };

  const handleViewProfile = () => {
    navigate(`/profile/${user.username}`);
  };

  if (loading) {
    return <Typography variant="h6">Loading...</Typography>;
  }

  return (
    <Container sx={{ mt: 4 }}>
      <Grid container spacing={2}>
        {/* Sidebar */}
        <Grid
          item
          xs={3}
          sx={{
            borderRight: "1px solid #e0e0e0",
            pr: 2,
            position: "relative",
            height: "100vh",
          }}
        >
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
            <ListItem button onClick={handleViewProfile}>
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
          <Box position="absolute" bottom={5} p={2} width="90%">
            <Grid container alignItems="center" spacing={2}>
              <Grid item>
                <Avatar alt={user?.username} src="/path/to/avatar.jpg" />
              </Grid>
              <Grid item xs>
                <Typography variant="body1">{user?.username}</Typography>
                <Typography variant="body2" color="textSecondary">
                  @{user?.username}
                </Typography>
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
        <Grid
          item
          xs={6}
          sx={{ borderRight: "1px solid #e0e0e0", paddingTop: 2 }}
        >
          <CreatePost onPostCreated={handleNewPost} />
          <Box mt={4}>
            <Typography variant="h6">Posts</Typography>
            {posts.map((post) => (
              <Post key={post.id} post={post} />
            ))}
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
