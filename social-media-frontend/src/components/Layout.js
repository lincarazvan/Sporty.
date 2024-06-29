import React from 'react';
import { Grid, Container } from '@mui/material';
import Sidebar from './Sidebar';
import RightPanel from './RightPanel';

const Layout = ({ children }) => {
  return (
    <Container maxWidth="lg">
      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <Sidebar />
        </Grid>
        <Grid item xs={12} md={6}>
          {children}
        </Grid>
        <Grid item xs={12} md={3}>
          <RightPanel />
        </Grid>
      </Grid>
    </Container>
  );
};

export default Layout;