import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Navbar from './Navbar';

// Shared page shell: navbar on top and a responsive content area below
const Layout = ({ children }) => (
  <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
    <Navbar />
    <Container component="main" maxWidth="xl" sx={{ flexGrow: 1, py: { xs: 2, sm: 3 } }}>
      {children}
    </Container>
  </Box>
);

export default Layout;
