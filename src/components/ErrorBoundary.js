import { Component } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

// Catches unexpected rendering errors anywhere below it and shows a friendly
// page instead of a blank screen. Error boundaries must be class components.
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // Logged for debugging; a real app could send this to an error tracking service
    console.error('Unexpected error:', error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <Box
        role="alert"
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          px: 2,
          bgcolor: 'background.default',
          color: 'text.primary',
        }}
      >
        <ErrorOutlineIcon color="error" sx={{ fontSize: 64, mb: 2 }} />
        <Typography variant="h5" component="h1" gutterBottom>
          Something went wrong
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3, maxWidth: 420 }}>
          An unexpected error occurred. Reloading the page usually fixes it.
        </Typography>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button variant="contained" onClick={() => window.location.reload()}>
            Reload page
          </Button>
          <Button variant="outlined" href="/">
            Go to home
          </Button>
        </Box>
      </Box>
    );
  }
}

export default ErrorBoundary;
