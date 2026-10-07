import { Outlet } from 'react-router-dom';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Navbar from './Navbar';

// Shared page shell: navbar on top and the current page rendered below
const Layout = () => (
  <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
    <Navbar />
    <Container component="main" maxWidth="xl" sx={{ flexGrow: 1, py: { xs: 2, sm: 3 } }}>
      <Outlet />
    </Container>
  </Box>
);

export default Layout;
