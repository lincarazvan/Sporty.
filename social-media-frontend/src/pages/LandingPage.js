import React from 'react';
import { Link } from 'react-router-dom';
import { Button, Typography, Container, Grid, Box, Card, CardContent, AppBar, Toolbar } from '@mui/material';
import { styled } from '@mui/material/styles';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import SportsBasketballIcon from '@mui/icons-material/SportsBasketball';
import SportsTennisIcon from '@mui/icons-material/SportsTennis';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';

const HeroSection = styled(Box)(({ theme }) => ({
  backgroundColor: '#1F2937',
  color: '#F9FAF8',
  padding: theme.spacing(20, 0, 10), // Increased top padding
  backgroundImage: 'url(/hero-bg.jpg)',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  }
}));

const FeatureCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: theme.spacing(3),
  transition: 'transform 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-10px)',
  }
}));

const LogoText = styled(Typography)(({ theme }) => ({
  fontWeight: 'bold',
  fontSize: '1.5rem',
  letterSpacing: '0.1em',
  color: theme.palette.primary.main,
}));

const LandingPage = () => {
  return (
    <Box>
      <AppBar position="fixed" color="transparent" elevation={0} sx={{ bgcolor: 'rgba(31, 41, 55, 0.8)' }}>
        <Container maxWidth="lg">
          <Toolbar disableGutters>
            <LogoText variant="h6" component="div" sx={{ flexGrow: 1 }}>
              SPORTY.
            </LogoText>
            <Button 
              color="inherit" 
              component={Link} 
              to="/login"
              variant="outlined"
              sx={{ mr: 2, color: 'white', borderColor: 'white' }}
            >
              Login
            </Button>
            <Button 
              color="primary" 
              variant="contained" 
              component={Link} 
              to="/register"
            >
              Register
            </Button>
          </Toolbar>
        </Container>
      </AppBar>

      <HeroSection>
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h2" component="h1" gutterBottom fontWeight="bold">
                The Ultimate Sports Social Media
              </Typography>
              <Typography variant="h5" paragraph>
                Connect with sports fans, follow your favorite teams, and never miss a game.
              </Typography>
              <Button
                variant="contained"
                color="primary"
                size="large"
                component={Link}
                to="/register"
                sx={{ mt: 2 }}
              >
                Join the Community
              </Button>
            </Grid>
          </Grid>
        </Container>
      </HeroSection>

      <Container maxWidth="lg" sx={{ my: 8 }}>
        <Typography variant="h3" align="center" gutterBottom fontWeight="bold">
          Everything You Need in One Place
        </Typography>
        <Grid container spacing={4} sx={{ mt: 4 }}>
          {[
            { icon: <SportsSoccerIcon fontSize="large" />, title: 'Football' },
            { icon: <SportsBasketballIcon fontSize="large" />, title: 'Basketball' },
            { icon: <SportsTennisIcon fontSize="large" />, title: 'Tennis' },
            { icon: <MoreHorizIcon fontSize="large" />, title: 'And Much More' },
          ].map((item, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <FeatureCard>
                {item.icon}
                <CardContent>
                  <Typography variant="h6" align="center">
                    {item.title}
                  </Typography>
                </CardContent>
              </FeatureCard>
            </Grid>
          ))}
        </Grid>
      </Container>

      <Box sx={{ backgroundColor: '#E5E7EB', py: 8 }}>
        <Container maxWidth="md">
          <Typography variant="h4" align="center" gutterBottom fontStyle="italic">
            "Sport has the power to change the world. It has the power to inspire. It has the power to unite people in a way that little else does."
          </Typography>
          <Typography variant="h6" align="center">
            - Nelson Mandela
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="md" sx={{ my: 8 }}>
        <Card sx={{ backgroundColor: '#3882F6', color: 'white' }}>
          <CardContent sx={{ py: 4 }}>
            <Grid container alignItems="center" justifyContent="space-between">
              <Grid item xs={12} md={8}>
                <Typography variant="h4" gutterBottom>
                  Ready to join the sports community?
                </Typography>
                <Typography variant="h6">
                  Sign up now and start connecting with sports enthusiasts!
                </Typography>
              </Grid>
              <Grid item xs={12} md={4} sx={{ textAlign: 'center', mt: { xs: 2, md: 0 } }}>
                <Button
                  variant="outlined"
                  color="inherit"
                  size="large"
                  component={Link}
                  to="/register"
                >
                  Sign Up Now
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Container>

      <Box sx={{ backgroundColor: '#1F2937', color: 'white', py: 3, textAlign: 'center' }}>
        <Typography>
          Sporty &copy; {new Date().getFullYear()}
        </Typography>
      </Box>
    </Box>
  );
};

export default LandingPage;

      
