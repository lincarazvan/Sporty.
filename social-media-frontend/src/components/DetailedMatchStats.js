import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Select, MenuItem, Grid, Paper, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  CircularProgress
} from '@mui/material';
import axios from 'axios';
import { Pie, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const DetailedMatchStats = () => {
    console.log('DetailedMatchStats called');
  const [selectedMatch, setSelectedMatch] = useState('');
  const [matchStats, setMatchStats] = useState(null);
  const [recentStats, setRecentStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState([]);

  useEffect(() => {
    fetchTopMatches();
  }, []);

  useEffect(() => {
    if (selectedMatch) {
      fetchMatchStats(selectedMatch);
      fetchRecentStats(selectedMatch);
    }
  }, [selectedMatch]);

  const fetchTopMatches = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/sports/top-matches');
      console.log('Top matches:', response.data);
      setMatches(response.data);
    } catch (error) {
      console.error('Error fetching top matches:', error);
    }
  };

  const fetchMatchStats = async (matchId) => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:3000/api/sports/match-stats/${matchId}`);
      setMatchStats(response.data);
    } catch (error) {
      console.error('Error fetching match stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentStats = async (matchId) => {
    try {
      const response = await axios.get(`http://localhost:3000/api/sports/recent-stats/${matchId}`);
      setRecentStats(response.data);
    } catch (error) {
      console.error('Error fetching recent stats:', error);
    }
  };

  const PossessionChart = ({ home, away }) => {
    const data = {
      labels: ['Home', 'Away'],
      datasets: [
        {
          data: [home, away],
          backgroundColor: ['#FF6384', '#36A2EB'],
          hoverBackgroundColor: ['#FF6384', '#36A2EB']
        }
      ]
    };

    return <Pie data={data} />;
  };

  const ShotsChart = ({ home, away }) => {
    const data = {
      labels: ['Home', 'Away'],
      datasets: [
        {
          label: 'Shots',
          data: [home, away],
          backgroundColor: ['rgba(255, 99, 132, 0.5)', 'rgba(54, 162, 235, 0.5)'],
          borderColor: ['rgb(255, 99, 132)', 'rgb(54, 162, 235)'],
          borderWidth: 1
        }
      ]
    };

    const options = {
      scales: {
        y: {
          beginAtZero: true
        }
      }
    };

    return <Bar data={data} options={options} />;
  };

  const RecentFormChart = ({ homeTeam, awayTeam }) => {
    const getFormPoints = (matches) => {
      return matches.map(match => {
        if (match.teams.home.winner) return 3;
        if (match.teams.away.winner) return 0;
        return 1;
      }).reverse();
    };

    const data = {
      labels: ['Match 5', 'Match 4', 'Match 3', 'Match 2', 'Last Match'],
      datasets: [
        {
          label: homeTeam.name,
          data: getFormPoints(homeTeam.recentMatches),
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
          borderColor: 'rgb(255, 99, 132)',
          borderWidth: 1
        },
        {
          label: awayTeam.name,
          data: getFormPoints(awayTeam.recentMatches),
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
          borderColor: 'rgb(54, 162, 235)',
          borderWidth: 1
        }
      ]
    };

    const options = {
      scales: {
        y: {
          beginAtZero: true,
          max: 3,
          ticks: {
            stepSize: 1
          }
        }
      }
    };

    return <Bar data={data} options={options} />;
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Detailed Match Statistics</Typography>
      {matches.length === 0 ? (
        <Typography>Loading matches...</Typography>
      ) : (
        <Select
          value={selectedMatch}
          onChange={(e) => setSelectedMatch(e.target.value)}
          fullWidth
          sx={{ mb: 3 }}
        >
          {matches.map((match) => (
            <MenuItem key={match.fixture.id} value={match.fixture.id}>
              {`${match.teams.home.name} vs ${match.teams.away.name}`}
            </MenuItem>
          ))}
        </Select>
        )}

      {loading ? (
        <CircularProgress />
      ) : matchStats ? (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>Ball Possession</Typography>
              <PossessionChart 
                home={parseInt(matchStats[0].statistics.find(stat => stat.type === "Ball Possession").value)} 
                away={parseInt(matchStats[1].statistics.find(stat => stat.type === "Ball Possession").value)} 
              />
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>Total Shots</Typography>
              <ShotsChart 
                home={parseInt(matchStats[0].statistics.find(stat => stat.type === "Total Shots").value)} 
                away={parseInt(matchStats[1].statistics.find(stat => stat.type === "Total Shots").value)} 
              />
            </Paper>
          </Grid>
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>Match Statistics</Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Stat</TableCell>
                      <TableCell align="right">{matchStats[0].team.name}</TableCell>
                      <TableCell align="right">{matchStats[1].team.name}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {matchStats[0].statistics.map((stat, index) => (
                      <TableRow key={stat.type}>
                        <TableCell component="th" scope="row">{stat.type}</TableCell>
                        <TableCell align="right">{stat.value}</TableCell>
                        <TableCell align="right">{matchStats[1].statistics[index].value}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
          {recentStats && (
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>Recent Form (Last 5 Matches)</Typography>
                <RecentFormChart homeTeam={recentStats.homeTeam} awayTeam={recentStats.awayTeam} />
              </Paper>
            </Grid>
          )}
        </Grid>
      ) : (
        <Typography>Select a match to view detailed statistics</Typography>
      )}
    </Box>
  );
};

export default DetailedMatchStats;