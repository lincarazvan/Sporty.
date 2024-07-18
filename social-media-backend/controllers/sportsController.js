const axios = require('axios');
const NodeCache = require('node-cache');

const API_URL = 'https://v3.football.api-sports.io';
const API_KEY = process.env.API_FOOTBALL_KEY;
const myCache = new NodeCache({ stdTTL: 900 }); // Cache 15 minute

const fetchLiveScores = async () => {
  try {
    const response = await axios.get(`${API_URL}/fixtures`, {
      params: { live: 'all' },
      headers: {
        'x-rapidapi-host': 'v3.football.api-sports.io',
        'x-rapidapi-key': API_KEY
      }
    });
    return response.data.response.slice(0, 5); // Limita 5 meciuri
  } catch (error) {
    console.error('Error fetching live scores:', error);
    throw error;
  }
};

const fetchUpcomingFixtures = async (league = '39', next = '5') => {
  try {
    const response = await axios.get(`${API_URL}/fixtures`, {
      params: { 
        league: league,
        next: next
      },
      headers: {
        'x-rapidapi-host': 'v3.football.api-sports.io',
        'x-rapidapi-key': API_KEY
      }
    });
    return response.data.response;
  } catch (error) {
    console.error('Error fetching upcoming fixtures:', error);
    throw error;
  }
};

const fetchStandings = async (leagueId) => {
  try {
    const response = await axios.get(`${API_URL}/standings`, {
      params: { 
        league: leagueId,
        season: '2023'
      },
      headers: {
        'x-rapidapi-host': 'v3.football.api-sports.io',
        'x-rapidapi-key': API_KEY
      }
    });
    return response.data.response[0].league.standings[0];
  } catch (error) {
    console.error('Error fetching standings:', error);
    throw error;
  }
};

exports.getStandings = async (req, res) => {
  const { leagueId } = req.params;
  const cacheKey = `standings_${leagueId}`;
  const cachedData = myCache.get(cacheKey);

  if (cachedData) {
    return res.json(cachedData);
  }

  try {
    const data = await fetchStandings(leagueId);
    myCache.set(cacheKey, data);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching standings' });
  }
};

exports.getLiveScores = async (req, res) => {
  const cacheKey = 'liveScores';
  const cachedData = myCache.get(cacheKey);

  if (cachedData) {
    return res.json(cachedData);
  }

  try {
    const data = await fetchLiveScores();
    myCache.set(cacheKey, data);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching live scores' });
  }
};

exports.getUpcomingFixtures = async (req, res) => {
  const { league, next } = req.query;
  const cacheKey = `upcomingFixtures_${league}_${next}`;
  const cachedData = myCache.get(cacheKey);

  if (cachedData) {
    return res.json(cachedData);
  }

  try {
    const data = await fetchUpcomingFixtures(league, next);
    myCache.set(cacheKey, data);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching upcoming fixtures' });
  }
};

exports.updateCache = async () => {
  try {
    const liveScores = await fetchLiveScores();
    const upcomingFixtures = await fetchUpcomingFixtures();
    const premierLeagueStandings = await fetchStandings('39');
    
    myCache.set('liveScores', liveScores);
    myCache.set('upcomingFixtures', upcomingFixtures);
    myCache.set('standings_39', premierLeagueStandings);
    
    console.log('Cache updated successfully');
  } catch (error) {
    console.error('Error updating cache:', error);
  }
};

exports.getTopMatches = async (req, res) => {
  try {
    const response = await axios.get(`${API_URL}/fixtures`, {
      params: { 
        league: '39', // Premier League
        season: '2023', // Sezonul curent
        last: 10 // Ultimele 10 meciuri
      },
      headers: {
        'x-rapidapi-host': 'v3.football.api-sports.io',
        'x-rapidapi-key': API_KEY
      }
    });
    res.json(response.data.response);
  } catch (error) {
    console.error('Error fetching top matches:', error);
    res.status(500).json({ message: 'Error fetching top matches' });
  }
};

exports.getMatchStats = async (req, res) => {
  const { matchId } = req.params;
  try {
    const response = await axios.get(`${API_URL}/fixtures/statistics`, {
      params: { fixture: matchId },
      headers: {
        'x-rapidapi-host': 'v3.football.api-sports.io',
        'x-rapidapi-key': API_KEY
      }
    });
    res.json(response.data.response);
  } catch (error) {
    console.error('Error fetching match statistics:', error);
    res.status(500).json({ message: 'Error fetching match statistics' });
  }
};

exports.getRecentStats = async (req, res) => {
  const { matchId } = req.params;
  try {
    const matchDetails = await axios.get(`${API_URL}/fixtures`, {
      params: { id: matchId },
      headers: {
        'x-rapidapi-host': 'v3.football.api-sports.io',
        'x-rapidapi-key': API_KEY
      }
    });
    const { teams } = matchDetails.data.response[0];

    const [homeTeamStats, awayTeamStats] = await Promise.all([
      axios.get(`${API_URL}/fixtures`, {
        params: { team: teams.home.id, last: 5 },
        headers: {
          'x-rapidapi-host': 'v3.football.api-sports.io',
          'x-rapidapi-key': API_KEY
        }
      }),
      axios.get(`${API_URL}/fixtures`, {
        params: { team: teams.away.id, last: 5 },
        headers: {
          'x-rapidapi-host': 'v3.football.api-sports.io',
          'x-rapidapi-key': API_KEY
        }
      })
    ]);

    res.json({
      homeTeam: {
        name: teams.home.name,
        recentMatches: homeTeamStats.data.response
      },
      awayTeam: {
        name: teams.away.name,
        recentMatches: awayTeamStats.data.response
      }
    });
  } catch (error) {
    console.error('Error fetching recent statistics:', error);
    res.status(500).json({ message: 'Error fetching recent statistics' });
  }
};