import React, { useContext } from "react";
import { Container, Grid, Paper, Box } from "@mui/material";
import LeftSidebar from "./LeftSidebar";
import Header from "./Header";
import AuthContext from "../context/AuthContext";
import { useLocation } from 'react-router-dom';
import SportsSidebar from "./SportsSidebar";
import { Sports } from "@mui/icons-material";

const Layout = ({ children }) => {
  const { user } = useContext(AuthContext);
  const location = useLocation();

  return (
    <Box
      sx={{
        flexGrow: 1,
        paddingTop: "80px", 
        backgroundColor: "#f0f2f5",
        minHeight: "100vh",
      }}
    >
      <Header />
      <Container maxWidth="lg" sx={{ mt: 2 }}>
        <Grid container spacing={2}>
          {user && (
            <Grid item xs={12} md={3}>
              <Paper sx={{ position: "sticky", top: 80 }}>
                {" "}
                {}
                <LeftSidebar />
              </Paper>
            </Grid>
          )}
          <Grid item xs={12} md={user ? 6 : 9}>
            {children}{" "}
            {}
          </Grid>
          {user && (
            <Grid item xs={12} md={3}>
              <Paper sx={{ position: "sticky", top: 60 }}>
                <SportsSidebar />
              </Paper>
            </Grid>
          )}
        </Grid>
      </Container>
    </Box>
  );
};

export default Layout;
