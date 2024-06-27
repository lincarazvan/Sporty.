import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, Typography, Box, Avatar, CardMedia, IconButton, TextField, Button, Link } from '@mui/material';
import { Favorite, FavoriteBorder, Comment as CommentIcon } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import axios from 'axios';

const Post = ({ post }) => {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  const fetchLikes = useCallback(async () => {
    try {
      const response = await axios.get(`http://localhost:3000/api/likes/${post.id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setLikeCount(response.data.likes);
      setLiked(response.data.userLiked);
    } catch (error) {
      console.error('Error fetching likes:', error);
    }
  }, [post.id]);

  const handleLike = async () => {
    try {
      const response = await axios.post(`http://localhost:3000/api/likes/${post.id}`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setLiked(response.data.liked);
      fetchLikes();
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const [comments, setComments] = useState([]);
  const [commentCount, setCommentCount] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [showComments, setShowComments] = useState(false);

  const fetchComments = useCallback(async () => {
    try {
      const response = await axios.get(`http://localhost:3000/api/comments/${post.id}`);
      setComments(response.data);
      setCommentCount(response.data.length);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  }, [post.id]);

  useEffect(() => {
    fetchLikes();
    fetchComments(); // Fetch comments on component mount
  }, [fetchLikes, fetchComments]);

  useEffect(() => {
    if (showComments) {
      fetchComments();
    }
  }, [showComments, fetchComments]);

  const handleAddComment = async () => {
    try {
      const response = await axios.post('http://localhost:3000/api/comments', {
        content: newComment,
        postId: post.id
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setComments(prevComments => [response.data, ...prevComments]);
      setCommentCount(prevCount => prevCount + 1);
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

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
          <Typography variant="h6" component={RouterLink} to={`/profile/${post.User.username}`}>{post.User?.username || 'Unknown User'}</Typography>
        </Box>
        <Typography variant="body1" gutterBottom>
          {renderContent(post.content)}
        </Typography>
        {post.imagePath && (
          <CardMedia
            component="img"
            image={`http://localhost:3000/${post.imagePath}`}
            alt="Post image"
            sx={{ borderRadius: 1, mt: 2, mb: 2, maxHeight: 300, objectFit: 'contain' }}
          />
        )}
        
        <Typography variant="caption" color="text.secondary">
          {new Date(post.createdAt).toLocaleString()}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
        <IconButton onClick={handleLike}>
          {liked ? <Favorite color="error" /> : <FavoriteBorder />}
        </IconButton>
        <Typography variant="body2">{likeCount} likes</Typography>
        <IconButton onClick={() => setShowComments(!showComments)}>
          <CommentIcon />
        </IconButton>
        <Typography variant="body2">{commentCount} comments</Typography>
      </Box>

        {showComments && (
        <Box sx={{ mt: 2 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            sx={{ mb: 1 }}
          />
          <Button variant="contained" onClick={handleAddComment}>
            Post Comment
          </Button>
          {comments.map((comment) => (
  <Box key={comment.id} sx={{ mt: 2 }}>
    <Typography 
      variant="subtitle2" 
      component={RouterLink} 
      to={`/profile/${comment.User.username}`}
      sx={{ textDecoration: 'none', color: 'inherit', '&:hover': { textDecoration: 'underline' } }}
    >
      {comment.User.username}
    </Typography>
    <Typography variant="body2">{comment.content}</Typography>
  </Box>
))}
        </Box>
        )}

        
      </CardContent>
    </Card>
  );
};

export default Post;