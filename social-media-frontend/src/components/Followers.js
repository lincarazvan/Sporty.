import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import AuthContext from '../context/AuthContext';

const socket = io('http://localhost:3000');

const Followers = () => {
  const { user, loading, error } = useContext(AuthContext);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    if (user && user.id) {
      const fetchFollowers = async () => {
        try {
          const result = await axios.get(`/api/follow/followers/${user.id}`);
          setFollowers(result.data);
        } catch (error) {
          console.error('Error fetching followers:', error);
        }
      };

      const fetchFollowing = async () => {
        try {
          const result = await axios.get(`/api/follow/following/${user.id}`);
          setFollowing(result.data);
        } catch (error) {
          console.error('Error fetching following:', error);
        }
      };

      const fetchRequests = async () => {
        try {
          const result = await axios.get('/api/follow/requests');
          setRequests(result.data);
        } catch (error) {
          console.error('Error fetching follow requests:', error);
        }
      };

      fetchFollowers();
      fetchFollowing();
      fetchRequests();
      
      socket.on('newFollowRequest', (request) => {
        setRequests((prevRequests) => [...prevRequests, request]);
      });

      socket.on('followRequestAccepted', (follow) => {
        setFollowing((prevFollowing) => [...prevFollowing, follow]);
      });

      return () => {
        socket.off('newFollowRequest');
        socket.off('followRequestAccepted');
      };
    }
  }, [user]);

  const acceptRequest = async (followId) => {
    try {
      await axios.put(`/api/follow/accept/${followId}`);
      setRequests(requests.filter(request => request.id !== followId));
      setFollowers([...followers, { id: followId }]);
      socket.emit('acceptFollowRequest', { followId });
    } catch (error) {
      console.error('Error accepting follow request:', error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!user) {
    return <div>Please log in to see your followers and following.</div>;
  }

  return (
    <div>
      <h2>Followers</h2>
      <ul>
        {followers.map(follower => (
          <li key={follower.followerId}>{follower.followerId}</li>
        ))}
      </ul>
      <h2>Following</h2>
      <ul>
        {following.map(follow => (
          <li key={follow.followingId}>{follow.followingId}</li>
        ))}
      </ul>
      <h2>Follow Requests</h2>
      <ul>
        {requests.map(request => (
          <li key={request.followerId}>
            {request.followerId} <button onClick={() => acceptRequest(request.id)}>Accept</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Followers;
