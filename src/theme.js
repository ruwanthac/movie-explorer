import { createTheme } from '@mui/material/styles';

// Builds the MUI theme for the given mode ('light' or 'dark').
// Colours are tuned so movie posters stand out in both modes.
const getTheme = (mode) =>
  createTheme({
    palette: {
      mode,
      primary: {
        main: mode === 'dark' ? '#90caf9' : '#1565c0',
      },
      secondary: {
        main: '#f5c518', // gold accent used for ratings
      },
      background:
        mode === 'dark'
          ? { default: '#0f1115', paper: '#181b22' }
          : { default: '#f5f6f8', paper: '#ffffff' },
    },
    shape: {
      borderRadius: 10,
    },
    typography: {
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      h1: { fontWeight: 700 },
      h2: { fontWeight: 700 },
      h3: { fontWeight: 700 },
    },
  });

export default getTheme;
