import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Button } from '@mui/material';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

axios.defaults.baseURL = 'http://localhost:3000/api';
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const FollowButton = ({ userId, onFollowChange }) => {
  const { user } = useContext(AuthContext);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);

  const checkFollowStatus = useCallback(async () => {
    try {
      const response = await axios.get(`/follow/following/${user.id}`);
      setIsFollowing(response.data.some(followedUser => followedUser.id === userId));
    } catch (error) {
      console.error('Error checking follow status:', error);
    }
  }, [user.id, userId]);
  
  const handleFollow = async () => {
    setLoading(true);
    try {
      if (isFollowing) {
        await axios.delete(`/follow/${userId}`);
      } else {
        await axios.post('/follow', { followingId: userId });
      }
      setIsFollowing(!isFollowing);
      if (onFollowChange) {
        onFollowChange(!isFollowing);
      }
    } catch (error) {
      console.error('Error following/unfollowing user:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    checkFollowStatus();
  }, [checkFollowStatus]);

  if (user.id === userId) return null;

  return (
    <Button
      variant={isFollowing ? "outlined" : "contained"}
      color="primary"
      onClick={handleFollow}
      disabled={loading}
    >
      {isFollowing ? 'Unfollow' : 'Follow'}
    </Button>
  );
};

export default FollowButton;