import React from 'react';
import { Card, CardContent, Typography, Box, Avatar } from '@mui/material';

const Post = ({ post }) => {
  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar sx={{ mr: 2 }}>{post.username[0]}</Avatar>
          <Typography variant="h6">{post.username}</Typography>
        </Box>
        <Typography variant="body1" gutterBottom>
          {post.content}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {new Date(post.createdAt).toLocaleString()}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default Post;
