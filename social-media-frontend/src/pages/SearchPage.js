import React, { useState, useEffect } from 'react';
import { TextField, Typography, Box, List, ListItem, ListItemAvatar, ListItemText, Avatar, Divider, Paper } from '@mui/material';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Post from '../components/Post';

const SearchPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const search = async () => {
      if (searchTerm.trim() === '') {
        setUsers([]);
        setPosts([]);
        return;
      }

      try {
        const usersResponse = await axios.get(`http://localhost:3000/api/users/search?query=${searchTerm}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setUsers(usersResponse.data);

        const postsResponse = await axios.get(`http://localhost:3000/api/posts/search?query=${searchTerm}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setPosts(postsResponse.data);
      } catch (error) {
        console.error('Error searching:', error);
      }
    };

    const debounce = setTimeout(() => {
      search();
    }, 300);

    return () => clearTimeout(debounce);
  }, [searchTerm]);

  return (
    <Box sx={{ maxWidth: 600, margin: 'auto', mt: 4 }}>
      <TextField
        fullWidth
        variant="outlined"
        label="Search users and posts"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ mb: 4 }}
      />

      <Paper elevation={3} sx={{ p: 2, mb: 4 }}>
        <Typography variant="h6" gutterBottom>Users</Typography>
        <List>
          {users.map((user) => (
            <ListItem key={user.id} component={Link} to={`/profile/${user.username}`} sx={{ textDecoration: 'none', color: 'inherit' }}>
              <ListItemAvatar>
                <Avatar src={user.avatarUrl} alt={user.username} />
              </ListItemAvatar>
              <ListItemText primary={user.username} secondary={`@${user.username}`} />
            </ListItem>
          ))}
        </List>
        {users.length === 0 && <Typography>No users found</Typography>}
      </Paper>

      <Paper elevation={3} sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>Posts</Typography>
        {posts.map((post) => (
          <React.Fragment key={post.id}>
            <Post post={post} />
            <Divider sx={{ my: 2 }} />
          </React.Fragment>
        ))}
        {posts.length === 0 && <Typography>No posts found</Typography>}
      </Paper>
    </Box>
  );
};

export default SearchPage;