import React, { useContext } from "react";
import { Container, Grid, Paper, Box } from "@mui/material";
import LeftSidebar from "./LeftSidebar";
import RightSidebar from "./RightSidebar";
import Header from "./Header";
import AuthContext from "../context/AuthContext";

const Layout = ({ children }) => {
  const { user } = useContext(AuthContext);

  return (
    <Box sx={{ 
      flexGrow: 1, 
      paddingTop: '80px', // Compensează pentru header-ul fix
      backgroundColor: '#f0f2f5',
      minHeight: '100vh'
    }}>
      <Header />
      <Container maxWidth="lg" sx={{ mt: 2 }}>
        <Grid container spacing={2}>
          {user && (
            <Grid item xs={12} md={3}>
              <Paper sx={{ position: "sticky", top: 80 }}> {/* Ajustat top pentru a fi mai aproape de header */}
                <LeftSidebar />
              </Paper>
            </Grid>
          )}
          <Grid item xs={12} md={user ? 6 : 9}>
            {children} {/* Nu mai este nevoie de Box și margin suplimentar aici */}
          </Grid>
          {user && (
            <Grid item xs={12} md={3}>
              <Paper sx={{ position: "sticky", top: 60 }}> {/* Ajustat top pentru a fi mai aproape de header */}
                <RightSidebar />
              </Paper>
            </Grid>
          )}
        </Grid>
      </Container>
    </Box>
  );
};

export default Layout;