import React from 'react';
import { Card, CardContent, Typography, Box, Avatar, CardMedia, Link } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const Post = ({ post }) => {
  const renderContent = (content) => {
    return content.split(' ').map((word, index) => {
      if (word.startsWith('#')) {
        return (
          <Link
            key={index}
            component={RouterLink}
            to={`/hashtag/${word.slice(1)}`}
            color="primary"
          >
            {word}{' '}
          </Link>
        );
      }
      return word + ' ';
    });
  };


  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar sx={{ mr: 2 }}>{post.User?.username?.[0] || '?'}</Avatar>
          <Typography variant="h6">{post.User?.username || 'Unknown User'}</Typography>
        </Box>
        <Typography variant="body1" gutterBottom>
          {post?.content ? renderContent(post.content) : 'No content'}
        </Typography>
        {post?.imagePath && (
          <CardMedia
          component="img"
          image={`http://localhost:3000/${post.imagePath}`}
          alt="Post image"
          sx={{ borderRadius: 1, mt: 2, mb: 2, maxHeight: 300, objectFit: 'contain' }}
        />
        )}
        <Typography variant="caption" color="text.secondary">
          {post?.createdAt ? new Date(post.createdAt).toLocaleString() : 'Unknown date'}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default Post;