import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Typography, Avatar, Button, Grid } from '@mui/material';
import axios from 'axios';
import Post from '../components/Post';

const Profile = () => {
  const { username } = useParams();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchUserAndPosts = async () => {
      try {
        const userResponse = await axios.get(`http://localhost:3000/api/users/profile/${username}`);
        setUser(userResponse.data);

        const postsResponse = await axios.get(`http://localhost:3000/api/posts/user/${userResponse.data.id}`);
        setPosts(postsResponse.data);
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };

    fetchUserAndPosts();
  }, [username]);

  if (!user) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Container>
      <Grid container spacing={3} alignItems="center" sx={{ mb: 4 }}>
        <Grid item>
          <Avatar
            alt={user.username}
            src={user.avatarUrl}
            sx={{ width: 100, height: 100 }}
          />
        </Grid>
        <Grid item>
          <Typography variant="h4">{user.username}</Typography>
          <Typography variant="body1">{user.bio}</Typography>
          <Button variant="outlined" component={Link} to="/edit-profile">
            Edit Profile
          </Button>
        </Grid>
      </Grid>

      <Typography variant="h5" sx={{ mb: 2 }}>Posts</Typography>
      {posts.map(post => (
        <Post key={post.id} post={post} />
      ))}
    </Container>
  );
};

export default Profile;