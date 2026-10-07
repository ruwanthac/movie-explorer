import { Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import useDocumentTitle from '../hooks/useDocumentTitle';

// Shown for any URL that does not match a route
const NotFound = () => {
  useDocumentTitle('Page not found');

  return (
    <Box sx={{ textAlign: 'center', py: 8 }}>
      <Typography variant="h2" component="h1" color="primary" gutterBottom>
        404
      </Typography>
      <Typography variant="h6" component="p" gutterBottom>
        This page could not be found.
      </Typography>
      <Button component={RouterLink} to="/" variant="contained" sx={{ mt: 2 }}>
        Back to home
      </Button>
    </Box>
  );
};

export default NotFound;
