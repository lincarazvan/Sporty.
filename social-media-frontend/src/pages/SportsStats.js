import React, { useState, useEffect } from 'react';
import { 
  Typography, Box, Select, MenuItem, FormControl, InputLabel, 
  List, ListItem, ListItemText, Avatar, Chip, Divider,
  Tabs, Tab, Pagination, CircularProgress
} from '@mui/material';
import axios from 'axios';
import { format } from 'date-fns';
import Standings from './Standings';

const FixtureListItem = ({ fixture }) => (
  <ListItem>
    <Box display="flex" alignItems="center" width="100%">
      <Box flex={1} display="flex" alignItems="center">
        <Avatar src={fixture.teams.home.logo} alt={fixture.teams.home.name} />
        <ListItemText primary={fixture.teams.home.name} sx={{ ml: 1 }} />
      </Box>
      <Box flex={1} textAlign="center">
        <Chip 
          label={fixture.fixture.status.short === 'NS' 
            ? format(new Date(fixture.fixture.date), 'HH:mm') 
            : `${fixture.goals.home} - ${fixture.goals.away}`} 
          color={fixture.fixture.status.short === 'LIVE' ? 'error' : 'default'}
        />
        <Typography variant="caption" display="block">
          {format(new Date(fixture.fixture.date), 'dd MMM yyyy')}
        </Typography>
      </Box>
      <Box flex={1} display="flex" alignItems="center" justifyContent="flex-end">
        <ListItemText primary={fixture.teams.away.name} sx={{ mr: 1 }} align="right" />
        <Avatar src={fixture.teams.away.logo} alt={fixture.teams.away.name} />
      </Box>
    </Box>
  </ListItem>
);

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const SportsStats = () => {
  const [upcomingFixtures, setUpcomingFixtures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [competition, setCompetition] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [tabValue, setTabValue] = useState(0);
  const [page, setPage] = useState(1);
  const fixturesPerPage = 10;

  useEffect(() => {
    fetchUpcomingFixtures();
  }, []);

  const fetchUpcomingFixtures = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:3000/api/sports/upcoming-fixtures');
      if (response.data && Array.isArray(response.data)) {
        setUpcomingFixtures(response.data);
      } else {
        console.error('Unexpected data format:', response.data);
        setUpcomingFixtures([]);
      }
    } catch (error) {
      console.error('Error fetching upcoming fixtures:', error);
      setUpcomingFixtures([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCompetitionChange = (event) => {
    setCompetition(event.target.value);
    setPage(1);
  };

  const handleSortChange = (event) => {
    setSortBy(event.target.value);
    setPage(1);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const filteredAndSortedFixtures = upcomingFixtures
    .filter(fixture => competition === 'all' || fixture.league.id === parseInt(competition))
    .sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(a.fixture.date) - new Date(b.fixture.date);
      } else {
        return a.league.name.localeCompare(b.league.name);
      }
    });

  const paginatedFixtures = filteredAndSortedFixtures.slice(
    (page - 1) * fixturesPerPage,
    page * fixturesPerPage
  );

  const competitions = [...new Set(upcomingFixtures.map(fixture => fixture.league.id))];

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h4" gutterBottom>Sports Statistics</Typography>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="sports stats tabs">
          <Tab label="Upcoming Fixtures" />
          <Tab label="Standings" />
        </Tabs>
      </Box>
      <TabPanel value={tabValue} index={0}>
        <Box display="flex" justifyContent="space-between" mb={3}>
          <FormControl variant="outlined" style={{ minWidth: 200 }}>
            <InputLabel>Competition</InputLabel>
            <Select value={competition} onChange={handleCompetitionChange} label="Competition">
              <MenuItem value="all">All Competitions</MenuItem>
              {competitions.map(compId => (
                <MenuItem key={compId} value={compId}>
                  {upcomingFixtures.find(f => f.league.id === compId)?.league.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl variant="outlined" style={{ minWidth: 120 }}>
            <InputLabel>Sort By</InputLabel>
            <Select value={sortBy} onChange={handleSortChange} label="Sort By">
              <MenuItem value="date">Date</MenuItem>
              <MenuItem value="competition">Competition</MenuItem>
            </Select>
          </FormControl>
        </Box>
        {loading ? (
          <Box display="flex" justifyContent="center">
            <CircularProgress />
          </Box>
        ) : (
          <>
            <List>
              {paginatedFixtures.map((fixture) => (
                <React.Fragment key={fixture.fixture.id}>
                  <FixtureListItem fixture={fixture} />
                  <Divider />
                </React.Fragment>
              ))}
            </List>
            <Box display="flex" justifyContent="center" mt={3}>
              <Pagination
                count={Math.ceil(filteredAndSortedFixtures.length / fixturesPerPage)}
                page={page}
                onChange={handlePageChange}
                color="primary"
              />
            </Box>
          </>
        )}
      </TabPanel>
      <TabPanel value={tabValue} index={1}>
        <Standings />
      </TabPanel>
    </Box>
  );
};

export default SportsStats;