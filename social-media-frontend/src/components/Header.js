import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, InputBase, IconButton, Box, List, ListItem, ListItemText, ListItemAvatar, Avatar, Paper } from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(1),
    width: 'auto',
  },
  border: '1px solid #ccc',
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      width: '12ch',
      '&:focus': {
        width: '20ch',
      },
    },
  },
}));

const Header = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const searchUsers = async () => {
      if (searchTerm.trim() === '') {
        setSearchResults([]);
        return;
      }

      try {
        const response = await axios.get(`http://localhost:3000/api/users/search?query=${searchTerm}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setSearchResults(response.data);
      } catch (error) {
        console.error('Error searching users:', error);
      }
    };

    const debounce = setTimeout(() => {
      searchUsers();
    }, 300);

    return () => clearTimeout(debounce);
  }, [searchTerm]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setShowResults(true);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setShowResults(false);
    navigate(`/search?q=${searchTerm}`);
  };

  return (
    <AppBar position="fixed" color="default" elevation={1} sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar sx={{ minHeight: '40px !important', padding: '0 16px' }}>
        <IconButton
          edge="start"
          color="inherit"
          aria-label="open drawer"
          component={Link}
          to="/"
          sx={{ padding: 0 }}
        >
          <img src="/favicon.ico" alt="Sporty Logo" style={{ height: '24px' }} />
        </IconButton>
        <Box sx={{ flexGrow: 1 }} />
        <Box sx={{ position: 'relative' }}>
          <form onSubmit={handleSearchSubmit}>
            <Search>
              <SearchIconWrapper>
                <SearchIcon />
              </SearchIconWrapper>
              <StyledInputBase
                placeholder="Search users…"
                inputProps={{ 'aria-label': 'search' }}
                value={searchTerm}
                onChange={handleSearchChange}
                onBlur={() => setTimeout(() => setShowResults(false), 200)}
              />
            </Search>
          </form>
          {showResults && searchResults.length > 0 && (
            <Paper sx={{ position: 'absolute', top: '100%', right: 0, left: 0, zIndex: 1, maxHeight: 300, overflow: 'auto' }}>
              <List>
                {searchResults.map((user) => (
                  <ListItem 
                    key={user.id} 
                    component={Link} 
                    to={`/profile/${user.username}`}
                    onClick={() => setShowResults(false)}
                  >
                    <ListItemAvatar>
                      <Avatar src={user.avatarUrl} alt={user.username} />
                    </ListItemAvatar>
                    <ListItemText primary={user.username} />
                  </ListItem>
                ))}
              </List>
            </Paper>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;