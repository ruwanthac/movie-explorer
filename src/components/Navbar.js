import { Link as RouterLink, NavLink } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Box from '@mui/material/Box';
import MovieFilterIcon from '@mui/icons-material/MovieFilter';
import HomeIcon from '@mui/icons-material/Home';
import FavoriteIcon from '@mui/icons-material/Favorite';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import { useColorMode } from '../context/ThemeContext';

const NAV_LINKS = [
  { to: '/', label: 'Home', icon: <HomeIcon /> },
  { to: '/favorites', label: 'Favorites', icon: <FavoriteIcon /> },
];

// Top navigation bar with the app name, page links and the light/dark mode toggle
const Navbar = () => {
  const { mode, toggleColorMode } = useColorMode();
  const nextMode = mode === 'light' ? 'dark' : 'light';

  return (
    <AppBar position="sticky" color="default" elevation={1}>
      <Toolbar sx={{ gap: { xs: 0.5, sm: 1 } }}>
        <Box
          component={RouterLink}
          to="/"
          sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'inherit', textDecoration: 'none' }}
        >
          <MovieFilterIcon color="primary" />
          <Typography
            variant="h6"
            component="span"
            sx={{ fontWeight: 700, fontSize: { xs: '1.05rem', sm: '1.25rem' } }}
          >
            Movie Explorer
          </Typography>
        </Box>

        {/* Pushes the links and actions to the right */}
        <Box sx={{ flexGrow: 1 }} />

        {NAV_LINKS.map(({ to, label, icon }) => (
          <Button
            key={to}
            component={NavLink}
            to={to}
            end
            color="inherit"
            aria-label={label}
            sx={{
              minWidth: 0,
              px: { xs: 1, sm: 1.5 },
              // NavLink adds the "active" class to the link for the current page
              '&.active': { color: 'primary.main' },
              '& .MuiButton-startIcon': { mr: { xs: 0, sm: 1 } },
            }}
            startIcon={icon}
          >
            {/* Labels are hidden on small screens to save space */}
            <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
              {label}
            </Box>
          </Button>
        ))}

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
