import React, { useState, useEffect, useContext } from 'react';
import { Typography, List, ListItem, ListItemText, Divider } from '@mui/material';
import AuthContext from '../context/AuthContext';
import axios from 'axios';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const { user } = useContext(AuthContext);

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
    // Marcăm notificările ca citite
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

  return (
    <>
      <Typography variant="h4" gutterBottom>Notifications</Typography>
      <List>
        {notifications.length === 0 ? (
          <ListItem>
            <ListItemText primary="No notifications" />
          </ListItem>
        ) : (
          notifications.map((notification, index) => (
            <React.Fragment key={notification.id}>
              <ListItem alignItems="flex-start">
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