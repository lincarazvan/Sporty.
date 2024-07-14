import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const PrivateRoute = ({ children, adminOnly = false }) => {
  const { user } = useContext(AuthContext);
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (adminOnly && user.roleId !== 1) { // Presupunem că roleId 1 este pentru admin
    return <Navigate to="/home" replace />;
  }

  return <Layout>{children}</Layout>;
};

export default PrivateRoute;