import React, { useState, useEffect, useCallback, useContext } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  CardMedia,
  IconButton,
  TextField,
  Button,
  Link,
  Menu,
  MenuItem,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
} from "@mui/material";
import {
  Favorite,
  FavoriteBorder,
  Comment as CommentIcon,
  MoreVert,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import axios from "axios";
import AuthContext from "../context/AuthContext";
import Comment from "./Comment";
import ReportDialog from "./ReportDialog";
import FlagIcon from '@mui/icons-material/Flag';

const Post = ({ post, onPostUpdate, onPostDelete }) => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [comments, setComments] = useState([]);
  const [commentCount, setCommentCount] = useState(post.commentCount || 0);
  const [newComment, setNewComment] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [newImage, setNewImage] = useState(null);
  const [newImagePreview, setNewImagePreview] = useState(null);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const avatarUrl = post.User?.avatarUrl 
  ? `http://localhost:3000${post.User.avatarUrl}` 
  : "/default-avatar.png";

console.log("Avatar URL:", avatarUrl);
    console.log("Post data received:", {
      id: post.id,
      content: post.content,
      User: post.User,
      avatarUrl: post.User?.avatarUrl
    });

  const handleCommentChange = (e) => {
    const newContent = e.target.value;
    setNewComment(newContent);

    const words = newContent.split(' ');
    const lastWord = words[words.length - 1];
    if (lastWord.startsWith('@') && lastWord.length > 1) {
      fetchUserSuggestions(lastWord.slice(1));
    } else {
      setSuggestions([]);
    }
  };

  const fetchUserSuggestions = async (partial) => {
    try {
      const response = await axios.get(`http://localhost:3000/api/users/search?query=${partial}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setSuggestions(response.data);
    } catch (error) {
      console.error('Error fetching user suggestions:', error);
    }
  };

  const handleSuggestionClick = (username) => {
    const words = newComment.split(' ');
    words[words.length - 1] = `@${username} `;
    setNewComment(words.join(' '));
    setSuggestions([]);
  };

  const fetchLikes = useCallback(async () => {
    try {
      const response = await axios.get(
        `http://localhost:3000/api/likes/${post.id}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setLikeCount(response.data.likes);
      setLiked(response.data.userLiked);
    } catch (error) {
      console.error("Error fetching likes:", error);
    }
  }, [post.id]);

  const fetchComments = useCallback(async () => {
    try {
      const response = await axios.get(
        `http://localhost:3000/api/comments/${post.id}`
      );
      setComments(response.data);
      setCommentCount(response.data.length);
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  }, [post.id]);

  useEffect(() => {
    fetchLikes();
    fetchComments();
  }, [fetchLikes, fetchComments]);

  const handleLike = async () => {
    try {
      const response = await axios.post(
        `http://localhost:3000/api/likes/${post.id}`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setLiked(response.data.liked);
      fetchLikes();
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

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

  const handleEditPost = async () => {
    try {
      const formData = new FormData();
      formData.append("content", editContent);
      if (newImage) {
        formData.append("image", newImage);
      }

      const response = await axios.put(
        `http://localhost:3000/api/posts/${post.id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      onPostUpdate(response.data);
      setEditMode(false);
      setNewImage(null);
      setNewImagePreview(null);
    } catch (error) {
      console.error("Error editing post:", error);
    }
  };

  const handleDeletePost = async () => {
    try {
      await axios.delete(`http://localhost:3000/api/posts/${post.id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      onPostDelete(post.id);
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  const handleDeleteImage = async () => {
    try {
      await axios.delete(`http://localhost:3000/api/posts/${post.id}/image`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setEditContent((prevContent) => prevContent);
      onPostUpdate({ ...post, imagePath: null });
    } catch (error) {
      console.error("Error deleting image:", error);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setNewImage(file);
    setNewImagePreview(URL.createObjectURL(file));
  };

  const handlePostClick = (e) => {
    if (e.target.closest('button, a')) {
      return;
    }
    navigate(`/post/${post.id}`);
  };

  const renderContent = (content) => {
    return content.split(/(\s+)/).map((word, index) => {
      if (word.startsWith("@")) {
        const username = word.slice(1);
        return (
          <RouterLink
            key={index}
            to={`/profile/${username}`}
            onClick={(e) => e.stopPropagation()}
            style={{ color: 'blue', textDecoration: 'none' }}
          >
            {word}
          </RouterLink>
        );
      } else if (word.startsWith("#")) {
        return (
          <RouterLink
            key={index}
            to={`/hashtag/${word.slice(1)}`}
            onClick={(e) => e.stopPropagation()}
            style={{ color: 'blue', textDecoration: 'none' }}
          >
            {word}
          </RouterLink>
        );
      }
      return word;
    });
  };

  return (
    <Card
      sx={{
        mb: 3,
        cursor: 'pointer',
        '&:hover': {
          boxShadow: 6,
        },
      }}
      onClick={handlePostClick}
    >
      <CardContent>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            mb: 2,
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
          <Avatar
              src={post.User && post.User.avatarUrl ? `http://localhost:3000${post.User.avatarUrl}` : undefined}
              alt={post.User && post.User.username ? post.User.username : "User"}
              sx={{ mr: 2 }}
            >
              {post.User && post.User.username ? post.User.username[0] : "?"}
            </Avatar>
            <Typography
              variant="h6"
              component={RouterLink}
              to={`/profile/${post.User?.username || ''}`}
              onClick={(e) => e.stopPropagation()}
              sx={{
                textDecoration: "none",
                color: "inherit",
                transition: "color 0.3s, text-decoration 0.3s",
                '&:hover': {
                  color: (theme) => theme.palette.primary.main,
                  textDecoration: "underline",
                },
                cursor: "pointer",
                padding: "4px 8px",
                borderRadius: "4px",
                '&:hover': {
                  backgroundColor: (theme) => theme.palette.action.hover,
                },
              }}
            >
              {post.User?.username || "Unknown User"}
            </Typography>
          </Box>
          {user && user.id === post.userId && (
            <>
              <IconButton onClick={(e) => { e.stopPropagation(); setAnchorEl(e.currentTarget); }}>
                <MoreVert />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}
              >
                <MenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditMode(true);
                    setAnchorEl(null);
                  }}
                >
                  Edit Post
                </MenuItem>
                <MenuItem onClick={(e) => { e.stopPropagation(); handleDeletePost(); }}>Delete Post</MenuItem>
              </Menu>
            </>
          )}
        </Box>
        {editMode ? (
          <Box onClick={(e) => e.stopPropagation()}>
            <TextField
              fullWidth
              multiline
              rows={4}
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              variant="outlined"
            />
            {post.imagePath && !newImagePreview && (
              <Box position="relative" mt={2}>
                <img
                  src={`http://localhost:3000/${post.imagePath}`}
                  alt="Post"
                  style={{ maxWidth: "100%", maxHeight: 200 }}
                />
                <IconButton
                  onClick={handleDeleteImage}
                  sx={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    backgroundColor: "rgba(0,0,0,0.5)",
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            )}
            {newImagePreview && (
              <Box position="relative" mt={2}>
                <img
                  src={newImagePreview}
                  alt="New Post"
                  style={{ maxWidth: "100%", maxHeight: 200 }}
                />
              </Box>
            )}
            {newImage && (
              <Typography variant="body2" color="textSecondary">
                Image selected: {newImage.name}
              </Typography>
            )}
            <input
              accept="image/*"
              style={{ display: "none" }}
              id={`post-image-${post.id}`}
              type="file"
              onChange={handleImageChange}
            />
            <label htmlFor={`post-image-${post.id}`}>
              <Button component="span">
                {post.imagePath ? "Change Image" : "Add Image"}
              </Button>
            </label>
            <Button onClick={handleEditPost}>Save</Button>
            <Button onClick={() => setEditMode(false)}>Cancel</Button>
          </Box>
        ) : (
          <>
            <Typography variant="body1" gutterBottom>
              {renderContent(post.content)}
            </Typography>
            {post.imagePath && (
              <CardMedia
                component="img"
                image={`http://localhost:3000/${post.imagePath}`}
                alt="Post image"
                sx={{
                  borderRadius: 1,
                  mt: 2,
                  mb: 2,
                  maxHeight: 300,
                  objectFit: "contain",
                }}
              />
            )}
          </>
        )}
        <Typography variant="caption" color="text.secondary">
          {new Date(post.createdAt).toLocaleString()}
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", mt: 2 }}>
          <IconButton onClick={(e) => { e.stopPropagation(); handleLike(); }}>
            {liked ? <Favorite color="error" /> : <FavoriteBorder />}
          </IconButton>
          <Typography variant="body2">{likeCount} likes</Typography>
          <IconButton onClick={(e) => { e.stopPropagation(); setShowComments(!showComments); }}>
            <CommentIcon />
          </IconButton>
          <Typography variant="body2">{commentCount} comments</Typography>
          <IconButton onClick={(e) => { e.stopPropagation(); setReportDialogOpen(true); }}>
            <FlagIcon />
          </IconButton>
        </Box>

        {showComments && (
          <Box sx={{ mt: 2 }} onClick={(e) => e.stopPropagation()}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Add a comment..."
              value={newComment}
              onChange={handleCommentChange}
              sx={{ mb: 1 }}
            />
            {suggestions.length > 0 && (
              <List>
                {suggestions.map(user => (
                  <ListItem
                    key={user.id}
                    button
                    onClick={() => handleSuggestionClick(user.username)}
                  >
                    <ListItemAvatar>
                      <Avatar src={user.avatarUrl} alt={user.username} />
                    </ListItemAvatar>
                    <ListItemText primary={user.username} />
                  </ListItem>
                ))}
              </List>
            )}
            <Button variant="contained" onClick={handleAddComment}>
              Post Comment
            </Button>
            {comments.map((comment) => (
              <Comment
                key={comment.id}
                comment={comment}
                setComments={setComments}
                comments={comments}
                setCommentCount={setCommentCount}
                postId={post.id}
                isReply={false}
              />
            ))}
          </Box>
        )}
      </CardContent>
      <ReportDialog
        open={reportDialogOpen}
        onClose={() => setReportDialogOpen(false)}
        itemId={post.id}
        itemType="post"
      />
    </Card>
  );
};

export default Post;
