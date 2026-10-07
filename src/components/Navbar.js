import { useState } from 'react';
import { Link as RouterLink, NavLink, useNavigate } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import Divider from '@mui/material/Divider';
import MovieFilterIcon from '@mui/icons-material/MovieFilter';
import HomeIcon from '@mui/icons-material/Home';
import FavoriteIcon from '@mui/icons-material/Favorite';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import LogoutIcon from '@mui/icons-material/Logout';
import { useColorMode } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

const NAV_LINKS = [
  { to: '/', label: 'Home', icon: <HomeIcon /> },
  { to: '/favorites', label: 'Favorites', icon: <FavoriteIcon /> },
];

// Top navigation bar with the app name, page links, theme toggle and user menu
const Navbar = () => {
  const { mode, toggleColorMode } = useColorMode();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuAnchor, setMenuAnchor] = useState(null);
  const nextMode = mode === 'light' ? 'dark' : 'light';

  const handleLogout = () => {
    setMenuAnchor(null);
    logout();
    navigate('/login', { replace: true });
  };

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

        {user && (
          <>
            <Tooltip title="Account">
              <IconButton
                onClick={(event) => setMenuAnchor(event.currentTarget)}
                aria-label="Account menu"
                aria-controls={menuAnchor ? 'account-menu' : undefined}
                aria-haspopup="true"
                size="small"
              >
                <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: '0.95rem' }}>
                  {user.username.charAt(0).toUpperCase()}
                </Avatar>
              </IconButton>
            </Tooltip>
            <Menu
              id="account-menu"
              anchorEl={menuAnchor}
              open={Boolean(menuAnchor)}
              onClose={() => setMenuAnchor(null)}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
              <MenuItem disabled>Signed in as {user.username}</MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <LogoutIcon fontSize="small" />
                </ListItemIcon>
                Logout
              </MenuItem>
            </Menu>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
