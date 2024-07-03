import React, { useState, useEffect, useCallback } from 'react';
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Paper, Typography, CircularProgress, Box, Select, MenuItem, FormControl, InputLabel, Alert
} from '@mui/material';
import axios from 'axios';

const Standings = () => {
  const [standings, setStandings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [league, setLeague] = useState('39'); // Default to Premier League

  const fetchStandings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`http://localhost:3000/api/sports/standings/${league}`);
      if (response.data && Array.isArray(response.data)) {
        setStandings(response.data);
      } else {
        throw new Error('Unexpected data format received from API');
      }
    } catch (error) {
      console.error('Error fetching standings:', error);
      setError(error.message || 'An error occurred while fetching standings');
    } finally {
      setLoading(false);
    }
  }, [league]);

  useEffect(() => {
    fetchStandings();
  }, [fetchStandings]);

  const handleLeagueChange = (event) => {
    setLeague(event.target.value);
  };

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">League Standings</Typography>
        <FormControl variant="outlined" style={{ minWidth: 200 }}>
          <InputLabel>League</InputLabel>
          <Select value={league} onChange={handleLeagueChange} label="League">
            <MenuItem value="39">Premier League</MenuItem>
            <MenuItem value="140">La Liga</MenuItem>
            <MenuItem value="135">Serie A</MenuItem>
            <MenuItem value="78">Bundesliga</MenuItem>
            <MenuItem value="283">Liga 1</MenuItem>
          </Select>
        </FormControl>
      </Box>
      {loading ? (
        <Box display="flex" justifyContent="center">
          <CircularProgress />
        </Box>
      ) : standings.length > 0 ? (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Position</TableCell>
                <TableCell>Team</TableCell>
                <TableCell align="right">Played</TableCell>
                <TableCell align="right">Won</TableCell>
                <TableCell align="right">Drawn</TableCell>
                <TableCell align="right">Lost</TableCell>
                <TableCell align="right">GF</TableCell>
                <TableCell align="right">GA</TableCell>
                <TableCell align="right">GD</TableCell>
                <TableCell align="right">Points</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {standings.map((team) => (
                <TableRow key={team.team.id}>
                  <TableCell component="th" scope="row">{team.rank}</TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <img src={team.team.logo} alt={team.team.name} style={{ width: 20, marginRight: 8 }} />
                      {team.team.name}
                    </Box>
                  </TableCell>
                  <TableCell align="right">{team.all.played}</TableCell>
                  <TableCell align="right">{team.all.win}</TableCell>
                  <TableCell align="right">{team.all.draw}</TableCell>
                  <TableCell align="right">{team.all.lose}</TableCell>
                  <TableCell align="right">{team.all.goals.for}</TableCell>
                  <TableCell align="right">{team.all.goals.against}</TableCell>
                  <TableCell align="right">{team.goalsDiff}</TableCell>
                  <TableCell align="right">{team.points}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Typography>No standings data available for this league.</Typography>
      )}
    </>
  );
};

export default Standings;