import React, { useState, useEffect, useContext } from 'react';
import { Typography, List, ListItem, ListItemText, Divider, Button, Box, Avatar, ListItemAvatar } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import axios from 'axios';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/notifications', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setNotifications(response.data);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    fetchNotifications();
    markNotificationsAsRead();
  }, [user.id]);

  const markNotificationsAsRead = async () => {
    try {
      await axios.put('http://localhost:3000/api/notifications/mark-read', {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };

  const handleNotificationClick = (notification) => {
    switch (notification.type) {
      case 'follow':
        if (notification.senderUsername) {
          navigate(`/profile/${notification.senderUsername}`);
        }
        break;
      case 'message':
        if (notification.senderId) {
          navigate('/chat', { state: { openChat: { id: notification.senderId, username: notification.senderUsername } } });
        }
        break;
      case 'like':
      case 'comment':
      case 'mention':
        if (notification.relatedId) {
          navigate(`/post/${notification.relatedId}`);
        }
        break;
      default:
        console.log('Unknown notification type');
    }
  };

  const handleDeleteAllNotifications = async () => {
    try {
      await axios.delete('http://localhost:3000/api/notifications', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setNotifications([]);
    } catch (error) {
      console.error('Error deleting notifications:', error);
    }
  };

  return (
    <>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4" gutterBottom>Notifications</Typography>
        <Button
          variant="contained"
          color="secondary"
          onClick={handleDeleteAllNotifications}
          disabled={notifications.length === 0}
        >
          Clear All Notifications
        </Button>
      </Box>
      <List>
        {notifications.length === 0 ? (
          <ListItem>
            <ListItemText primary="No notifications" />
          </ListItem>
        ) : (
          notifications.map((notification, index) => (
            <React.Fragment key={notification.id}>
              <ListItem
                button
                onClick={() => handleNotificationClick(notification)}
                alignItems="flex-start"
              >
                <ListItemAvatar>
                  <Avatar
                    src={notification.senderAvatarUrl ? `http://localhost:3000${notification.senderAvatarUrl}` : "/default-avatar.png"}
                    alt={notification.senderUsername || "User"}
                  >
                    {(!notification.senderAvatarUrl && notification.senderUsername) ? notification.senderUsername[0].toUpperCase() : null}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={notification.message}
                  secondary={new Date(notification.createdAt).toLocaleString()}
                />
              </ListItem>
              {index < notifications.length - 1 && <Divider />}
            </React.Fragment>
          ))
        )}
      </List>
    </>
  );
};

export default NotificationsPage;