import React, { useState, useContext, useCallback } from "react";
import {
  Box,
  Typography,
  IconButton,
  TextField,
  Button,
  Menu,
  MenuItem,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
} from "@mui/material";
import { MoreVert, ThumbUp, Reply } from "@mui/icons-material";
import { Link as RouterLink } from "react-router-dom";
import axios from "axios";
import AuthContext from "../context/AuthContext";
import { formatDistanceToNow } from "date-fns";

const Comment = ({
  comment,
  setComments,
  comments,
  setCommentCount,
  postId,
  isReply = false,
}) => {
  const { user } = useContext(AuthContext);
  const [anchorEl, setAnchorEl] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [replyMode, setReplyMode] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [likes, setLikes] = useState(comment.likes);
  const [isLiked, setIsLiked] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [suggestions, setSuggestions] = useState([]);

  const handleReplyChange = (e) => {
    const newContent = e.target.value;
    console.log('New reply content:', newContent);
    setReplyContent(newContent);
    
    const words = newContent.split(' ');
    const lastWord = words[words.length - 1];
    console.log('Last word:', lastWord);
    if (lastWord.startsWith('@') && lastWord.length > 1) {
      console.log('Fetching suggestions for:', lastWord.slice(1));
      fetchUserSuggestions(lastWord.slice(1));
    } else {
      setSuggestions([]);
    }
  };

  const fetchUserSuggestions = async (partial) => {
    try {
      console.log('Fetching suggestions for:', partial);
      const response = await axios.get(`http://localhost:3000/api/users/search?query=${partial}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      console.log('Suggestions received:', response.data);
      setSuggestions(response.data);
    } catch (error) {
      console.error('Error fetching user suggestions:', error);
    }
  };

  const handleSuggestionClick = (username) => {
    console.log('Suggestion clicked:', username);
    const words = replyContent.split(' ');
    words[words.length - 1] = `@${username} `;
    const newContent = words.join(' ');
    console.log('New content:', newContent);
    setReplyContent(newContent);
    setSuggestions([]);
  };

  const handleEditComment = async () => {
    try {
      await axios.put(
        `http://localhost:3000/api/comments/${comment.id}`,
        { content: editContent },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setComments((prevComments) =>
        prevComments.map((c) => {
          if (c.id === comment.id) {
            return { ...c, content: editContent };
          }
          if (c.Replies) {
            return {
              ...c,
              Replies: c.Replies.map((r) =>
                r.id === comment.id ? { ...r, content: editContent } : r
              ),
            };
          }
          return c;
        })
      );
      setEditMode(false);
    } catch (error) {
      console.error("Error editing comment:", error);
    }
  };

  const handleDeleteComment = async () => {
    try {
      await axios.delete(`http://localhost:3000/api/comments/${comment.id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setComments((prevComments) =>
        prevComments.filter((c) => {
          if (c.id === comment.id) {
            return false;
          }
          if (c.Replies) {
            c.Replies = c.Replies.filter((r) => r.id !== comment.id);
          }
          return true;
        })
      );
      setCommentCount((prevCount) => prevCount - 1);
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  const handleReply = async () => {
    try {
      const response = await axios.post(
        "http://localhost:3000/api/comments",
        {
          content: replyContent,
          postId,
          parentCommentId: comment.id,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setComments((prevComments) => {
        const updatedComments = [...prevComments];
        const parentComment = updatedComments.find((c) => c.id === comment.id);
        if (parentComment) {
          parentComment.Replies = [
            ...(parentComment.Replies || []),
            response.data,
          ];
        }
        return updatedComments;
      });
      setCommentCount((prevCount) => prevCount + 1);
      setReplyMode(false);
      setReplyContent("");
    } catch (error) {
      console.error("Error replying to comment:", error);
    }
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
      }
      return word;
    });
  };

  const handleLike = useCallback(async () => {
    if (isLiking) return;
    setIsLiking(true);
    try {
      const response = await axios.post(
        `http://localhost:3000/api/comments/${comment.id}/like`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setLikes(response.data.likes);
      setIsLiked(response.data.liked);
    } catch (error) {
      console.error("Error liking comment:", error);
    } finally {
      setIsLiking(false);
    }
  }, [comment.id, isLiking]);

  return (
    <Box sx={{ mt: 2, ml: isReply ? 4 : 0 }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
        <Avatar
          src={comment.User?.avatarUrl ? `http://localhost:3000${comment.User.avatarUrl}` : undefined}
          alt={comment.User?.username || 'User'}
          sx={{ mr: 1, width: 32, height: 32 }}
        >
          {comment.User?.username?.[0] || '?'}
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography
              variant="subtitle2"
              component={RouterLink}
              to={`/profile/${comment.User.username}`}
              sx={{ textDecoration: 'none', color: 'inherit', '&:hover': { textDecoration: 'underline' } }}
            >
              @{comment.User.username}
            </Typography>
            <Typography variant="caption" sx={{ ml: 1 }}>
              {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
            </Typography>
          </Box>
          {editMode ? (
            <Box>
              <TextField
                fullWidth
                multiline
                rows={2}
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                variant="outlined"
                size="small"
                sx={{ mt: 1 }}
              />
              <Button onClick={handleEditComment} size="small" sx={{ mt: 1 }}>Save</Button>
              <Button onClick={() => setEditMode(false)} size="small" sx={{ mt: 1, ml: 1 }}>Cancel</Button>
            </Box>
          ) : (
            <Typography variant="body2">{renderContent(comment.content)}</Typography>
          )}
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
            <IconButton
              size="small"
              onClick={handleLike}
              disabled={isLiking}
              color={isLiked ? "primary" : "default"}
            >
              <ThumbUp fontSize="small" />
            </IconButton>
            <Typography variant="caption" sx={{ ml: 0.5 }}>{likes}</Typography>
            {!isReply && (
              <IconButton size="small" onClick={() => setReplyMode(!replyMode)} sx={{ ml: 1 }}>
                <Reply fontSize="small" />
              </IconButton>
            )}
          </Box>
          {!isReply && replyMode && (
            <Box sx={{ mt: 1 }}>
              <TextField
                fullWidth
                multiline
                rows={2}
                value={replyContent}
                onChange={handleReplyChange}
                variant="outlined"
                size="small"
                placeholder="Write a reply..."
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
              <Button onClick={handleReply} size="small" sx={{ mt: 1 }}>Reply</Button>
              <Button onClick={() => setReplyMode(false)} size="small" sx={{ mt: 1, ml: 1 }}>Cancel</Button>
            </Box>
          )}
        </Box>
        {user && user.id === comment.userId && (
          <>
            <IconButton
              size="small"
              onClick={(e) => setAnchorEl(e.currentTarget)}
            >
              <MoreVert />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={() => setAnchorEl(null)}
            >
              <MenuItem onClick={() => { setEditMode(true); setAnchorEl(null); }}>Edit</MenuItem>
              <MenuItem onClick={handleDeleteComment}>Delete</MenuItem>
            </Menu>
          </>
        )}
      </Box>
      {comment.Replies && comment.Replies.map(reply => (
        <Comment
          key={reply.id}
          comment={reply}
          setComments={setComments}
          comments={comments}
          setCommentCount={setCommentCount}
          postId={postId}
          isReply={true}
        />
      ))}
    </Box>
  );
};

export default Comment;