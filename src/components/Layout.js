import { Outlet } from 'react-router-dom';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Navbar from './Navbar';
import StatusBanners from './StatusBanners';

// Shared page shell: navbar on top and the current page rendered below
const Layout = () => (
  <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
    {/* Lets keyboard users jump past the navbar; only visible when focused */}
    <Box
      component="a"
      href="#main-content"
      sx={{
        position: 'absolute',
        left: 8,
        top: -48,
        zIndex: 'tooltip',
        px: 2,
        py: 1,
        borderRadius: 1,
        bgcolor: 'primary.main',
        color: 'primary.contrastText',
        fontWeight: 600,
        textDecoration: 'none',
        '&:focus': { top: 8 },
      }}
    >
      Skip to content
    </Box>
    <Navbar />
    <Container
      component="main"
      id="main-content"
      tabIndex={-1}
      maxWidth="xl"
      sx={{ flexGrow: 1, py: { xs: 2, sm: 3 }, '&:focus': { outline: 'none' } }}
    >
      <StatusBanners />
      <Outlet />
    </Container>
  </Box>
);

export default Layout;
