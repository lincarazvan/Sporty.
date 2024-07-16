import React, { useState, useEffect, useContext } from 'react';
import { Typography, List, ListItem, ListItemText, Divider, Button, Box } from '@mui/material';
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
    if (notification.type === 'follow' && notification.senderUsername) {
      navigate(`/profile/${notification.senderUsername}`);
    } else if (notification.type === 'message' && notification.senderId) {
      navigate('/chat', { state: { openChat: { id: notification.senderId, username: notification.senderUsername } } });
    } else if ((notification.type === 'like' || notification.type === 'comment') && notification.relatedId) {
      navigate(`/post/${notification.relatedId}`);
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