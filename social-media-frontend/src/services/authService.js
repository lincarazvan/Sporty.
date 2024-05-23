import http from './httpService';

const API_URL = process.env.REACT_APP_API_URL + '/users';

export const login = async (email, password) => {
  const response = await http.post(`${API_URL}/login`, { email, password });
  if (response.data.token) {
    localStorage.setItem('user', JSON.stringify(response.data));
  }
  return response.data;
};

export const register = async (username, email, password) => {
  const response = await http.post(`${API_URL}/register`, { username, email, password });
  return response.data;
};

export const logout = () => {
  localStorage.removeItem('user');
};

export const getCurrentUser = () => {
  try {
    const user = localStorage.getItem('user');
    if (user) {
      return JSON.parse(user);
    }
  } catch (error) {
    console.error('Failed to get current user from localStorage:', error);
  }
  return null;
};
