const axios = require('axios');
const NodeCache = require('node-cache');

const API_URL = 'https://v3.football.api-sports.io';
const API_KEY = process.env.API_FOOTBALL_KEY;
const myCache = new NodeCache({ stdTTL: 900 }); // Cache for 15 minutes

const fetchLiveScores = async () => {
  try {
    const response = await axios.get(`${API_URL}/fixtures`, {
      params: { live: 'all' },
      headers: {
        'x-rapidapi-host': 'v3.football.api-sports.io',
        'x-rapidapi-key': API_KEY
      }
    });
    return response.data.response.slice(0, 5); // Limit to 5 matches
  } catch (error) {
    console.error('Error fetching live scores:', error);
    throw error;
  }
};

const fetchUpcomingFixtures = async () => {
  try {
    const response = await axios.get(`${API_URL}/fixtures`, {
      params: { 
        league: '39', // Premier League ID
        next: '5'     // Next 5 matches
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
  const cacheKey = 'upcomingFixtures';
  const cachedData = myCache.get(cacheKey);

  if (cachedData) {
    return res.json(cachedData);
  }

  try {
    const data = await fetchUpcomingFixtures();
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
    myCache.set('liveScores', liveScores);
    myCache.set('upcomingFixtures', upcomingFixtures);
    console.log('Cache updated successfully');
  } catch (error) {
    console.error('Error updating cache:', error);
  }
};