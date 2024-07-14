import React, { useState, useEffect } from 'react';
import { Typography, List, ListItem, ListItemText, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const SportsSidebar = () => {
  const [liveScores, setLiveScores] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchLiveScores();
    const interval = setInterval(fetchLiveScores, 300000); // Update la 5 minute
    return () => clearInterval(interval);
  }, []);

  const fetchLiveScores = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/sports/live-scores');
      setLiveScores(response.data.slice(0, 5));
    } catch (error) {
      console.error('Error fetching live scores:', error);
    }
  };

  const handleViewAllStats = () => {
    navigate('/sports-stats');
  };

  return (
    <>
      <Typography variant="h6" sx={{ p: 2 }}>Live Scores</Typography>
      <List>
        {liveScores.map((match) => (
          <ListItem key={match.fixture.id}>
            <ListItemText 
              primary={`${match.teams.home.name} ${match.goals.home} - ${match.goals.away} ${match.teams.away.name}`}
              secondary={match.league.name}
            />
          </ListItem>
        ))}
      </List>
      <Button 
        fullWidth 
        variant="outlined" 
        sx={{ mt: 2 }}
        onClick={handleViewAllStats}
      >
        View All Stats
      </Button>
    </>
  );
};

export default SportsSidebar;