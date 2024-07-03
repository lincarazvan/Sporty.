import React, { useState, useEffect } from 'react';
import { Typography, Grid, Card, CardContent } from '@mui/material';
import axios from 'axios';

const SportsStats = () => {
  const [upcomingFixtures, setUpcomingFixtures] = useState([]);

  useEffect(() => {
    fetchUpcomingFixtures();
  }, []);

  const fetchUpcomingFixtures = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/sports/upcoming-fixtures');
      setUpcomingFixtures(response.data);
    } catch (error) {
      console.error('Error fetching upcoming fixtures:', error);
    }
  };

  return (
    <>
      <Typography variant="h4" gutterBottom>Upcoming Fixtures</Typography>
      <Grid container spacing={3}>
        {upcomingFixtures.map((fixture) => (
          <Grid item xs={12} sm={6} md={4} key={fixture.fixture.id}>
            <Card>
              <CardContent>
                <Typography variant="h6">{fixture.teams.home.name} vs {fixture.teams.away.name}</Typography>
                <Typography>{new Date(fixture.fixture.date).toLocaleString()}</Typography>
                <Typography>{fixture.league.name}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </>
  );
};

export default SportsStats;