import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Typography, Avatar, Button, Box, Paper
} from '@mui/material';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import Post from '../components/Post';

const Profile = () => {
  const { username } = useParams();
  const { user } = useContext(AuthContext);
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
    <>
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
    </>
  );
};

export default Profile;