import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Typography,
  Avatar,
  Button,
  Box,
  Paper,
  Modal,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import axios from "axios";
import AuthContext from "../context/AuthContext";
import Post from "../components/Post";
import FollowButton from "../components/FollowButton";

const StyledModal = styled(Modal)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

const ModalContent = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[5],
  padding: theme.spacing(2, 4, 3),
  width: 400,
  maxHeight: "80vh",
  overflow: "auto",
  outline: "none",
}));

const StyledButton = styled(Button)(({ theme }) => ({
  color: theme.palette.primary.main,
  '&.Mui-disabled': {
    color: theme.palette.primary.main,
  },
}));

const Profile = () => {
  const { username } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState([]);
  const [modalTitle, setModalTitle] = useState("");

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const profileRes = await axios.get(
          `http://localhost:3000/api/users/profile/${username}`
        );
        setProfile(profileRes.data);
        const postsRes = await axios.get(
          `http://localhost:3000/api/posts/user/${profileRes.data.id}`
        );
        setPosts(postsRes.data);
        const followersRes = await axios.get(
          `http://localhost:3000/api/follow/followers/${profileRes.data.id}`
        );
        setFollowers(followersRes.data);
        const followingRes = await axios.get(
          `http://localhost:3000/api/follow/following/${profileRes.data.id}`
        );
        setFollowing(followingRes.data);
      } catch (error) {
        console.error("Error fetching profile data:", error);
      }
    };
    fetchProfileData();
  }, [username]);

  const handleOpenModal = (content, title) => {
    if (title !== "Posts") {
      setModalContent(content);
      setModalTitle(title);
      setModalOpen(true);
    }
  };

  const handleUserClick = (username) => {
    setModalOpen(false);
    navigate(`/profile/${username}`);
  };

  if (!profile) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <>
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Box display="flex" alignItems="center" mb={2}>
          <Avatar
            src={
              profile.avatarUrl
                ? `http://localhost:3000${profile.avatarUrl}`
                : "/default-avatar.png"
            }
            alt={profile.username}
            sx={{ width: 100, height: 100, mr: 2 }}
          />
          <Box>
            <Typography variant="h5">{profile.username}</Typography>
            <Typography variant="body1" color="textSecondary">
              @{profile.username}
            </Typography>
            {user && user.id !== profile.id && (
              <FollowButton userId={profile.id} />
            )}
          </Box>
        </Box>
        <Typography variant="body1" paragraph>
          {profile.bio || "No bio available"}
        </Typography>
        <Box display="flex" justifyContent="space-around" mb={2}>
  <StyledButton disabled>
    <Typography variant="body2">
      <strong>{posts.length}</strong> posts
    </Typography>
  </StyledButton>
  <Button onClick={() => handleOpenModal(followers, 'Followers')}>
    <Typography variant="body2">
      <strong>{followers.length}</strong> followers
    </Typography>
  </Button>
  <Button onClick={() => handleOpenModal(following, 'Following')}>
    <Typography variant="body2">
      <strong>{following.length}</strong> following
    </Typography>
  </Button>
</Box>
      </Paper>

      <Typography variant="h6" gutterBottom>
        Posts
      </Typography>
      {posts.map((post) => (
        <Post key={post.id} post={post} />
      ))}

      <StyledModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
      >
        <ModalContent>
          <Typography id="modal-title" variant="h6" component="h2" gutterBottom>
            {modalTitle}
          </Typography>
          <List id="modal-description">
            {modalContent.map((item) => (
              <ListItem
                key={item.id}
                button
                onClick={() => handleUserClick(item.username)}
              >
                <ListItemAvatar>
                  <Avatar
                    src={
                      item.avatarUrl
                        ? `http://localhost:3000${item.avatarUrl}`
                        : "/default-avatar.png"
                    }
                  />
                </ListItemAvatar>
                <ListItemText primary={item.username} />
              </ListItem>
            ))}
          </List>
        </ModalContent>
      </StyledModal>
    </>
  );
};

export default Profile;
