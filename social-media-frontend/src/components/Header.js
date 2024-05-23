import React from 'react';
import { Link } from 'react-router-dom';
import { getCurrentUser, logout } from '../services/authService';

const Header = () => {
  const user = getCurrentUser();

  const handleLogout = () => {
    logout();
    window.location.reload();
  };

  return (
    <header>
      <h1>Sporty</h1>
      <nav>
        <Link to="/">Home</Link>
        {user ? (
          <>
            <span>Welcome, {user.username}</span>
            <button onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </nav>
    </header>
  );
};

export default Header;
