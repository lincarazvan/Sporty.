import React from 'react';
import { List, ListItem, ListItemIcon, ListItemText, Typography } from '@mui/material';
import { TrendingUp } from '@mui/icons-material';

const RightSidebar = () => {
  const trendingTopics = [
    'Football',
    'Basketball',
    'Tennis',
    'Olympics',
    'Formula 1',
  ];

  return (
    <>
      <Typography variant="h6" sx={{ p: 2 }}>Trending Topics</Typography>
      <List>
        {trendingTopics.map((topic, index) => (
          <ListItem button key={index}>
            <ListItemIcon>
              <TrendingUp />
            </ListItemIcon>
            <ListItemText primary={topic} />
          </ListItem>
        ))}
      </List>
    </>
  );
};

export default RightSidebar;