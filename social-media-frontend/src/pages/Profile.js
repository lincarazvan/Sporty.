import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Container, Typography, Avatar, Button, Grid, CircularProgress } from '@mui/material';
import axios from 'axios';
import Post from '../components/Post';

const Profile = () => {
  const { username } = useParams();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserAndPosts = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const config = {
          headers: { Authorization: `Bearer ${token}` }
        };

        const userResponse = await axios.get(`http://localhost:3000/api/users/profile/${username}`, config);
        setUser(userResponse.data);

        const postsResponse = await axios.get(`http://localhost:3000/api/posts/user/${userResponse.data.id}`, config);
        setPosts(postsResponse.data);
      } catch (error) {
        console.error('Error fetching user profile:', error);
        if (error.response && error.response.status === 401) {
          setError('Session expired. Please login again.');
          // Redirect to login page
          navigate('/login');
        } else {
          setError('Failed to load profile. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndPosts();
  }, [username, navigate]);

  if (loading) {
    return <Container><CircularProgress /></Container>;
  }

  if (error) {
    return <Container><Typography color="error">{error}</Typography></Container>;
  }

  if (!user) {
    return <Container><Typography>User not found</Typography></Container>;
  }

  return (
    <Container>
      <Grid container spacing={3} alignItems="center" sx={{ mb: 4 }}>
        <Grid item>
        <Avatar
  alt={user.username}
  src={user.avatarUrl || '/default-avatar.png'} // Folosiți o imagine implicită dacă nu există avatarUrl
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
      {posts.length > 0 ? (
        posts.map(post => (
          <Post key={post.id} post={post} />
        ))
      ) : (
        <Typography>No posts yet</Typography>
      )}
    </Container>
  );
};

export default Profile;