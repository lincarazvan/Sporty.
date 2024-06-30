import React, { useState, useContext } from "react";
import {
  Box,
  Typography,
  IconButton,
  TextField,
  Button,
  Menu,
  MenuItem,
  Avatar,
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

  const handleLike = async () => {
    try {
      const response = await axios.post(
        `http://localhost:3000/api/comments/${comment.id}/like`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setLikes(response.data.likes);
    } catch (error) {
      console.error("Error liking comment:", error);
    }
  };

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
            <Typography variant="body2">{comment.content}</Typography>
          )}
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
            <IconButton size="small" onClick={handleLike}>
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
                onChange={(e) => setReplyContent(e.target.value)}
                variant="outlined"
                size="small"
                placeholder="Write a reply..."
              />
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
