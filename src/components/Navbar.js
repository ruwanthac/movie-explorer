import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Box from '@mui/material/Box';
import MovieFilterIcon from '@mui/icons-material/MovieFilter';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import { useColorMode } from '../context/ThemeContext';

// Top navigation bar with the app name and the light/dark mode toggle
const Navbar = () => {
  const { mode, toggleColorMode } = useColorMode();
  const nextMode = mode === 'light' ? 'dark' : 'light';

  return (
    <AppBar position="sticky" color="default" elevation={1}>
      <Toolbar sx={{ gap: 1 }}>
        <MovieFilterIcon color="primary" />
        <Typography
          variant="h6"
          component="span"
          sx={{ fontWeight: 700, fontSize: { xs: '1.05rem', sm: '1.25rem' } }}
        >
          Movie Explorer
        </Typography>

        {/* Pushes the actions to the right */}
        <Box sx={{ flexGrow: 1 }} />

        <Tooltip title={`Switch to ${nextMode} mode`}>
          <IconButton
            onClick={toggleColorMode}
            color="inherit"
            aria-label={`Switch to ${nextMode} mode`}
          >
            {mode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
          </IconButton>
        </Tooltip>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
