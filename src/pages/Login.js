import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import MovieFilterIcon from '@mui/icons-material/MovieFilter';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useAuth } from '../context/AuthContext';

// Login page with username and password fields
const Login = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  // Send the user back to the page they originally asked for
  const redirectTo = location.state?.from?.pathname || '/';

  // Already logged in - no need to show the form
  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  const handleSubmit = (event) => {
    event.preventDefault();
    const result = login(username, password);

    if (result.success) {
      navigate(redirectTo, { replace: true });
    } else {
      setErrors(result.errors);
    }
  };

  // Clear a field's error as soon as the user edits it again
  const handleChange = (setter, field) => (event) => {
    setter(event.target.value);
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
      }}
    >
      <Paper elevation={3} sx={{ width: '100%', maxWidth: 400, p: { xs: 3, sm: 4 } }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <MovieFilterIcon color="primary" sx={{ fontSize: 48 }} />
          <Typography variant="h5" component="h1" sx={{ fontWeight: 700 }}>
            Sign in
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Welcome to Movie Explorer
          </Typography>
        </Box>

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            label="Username"
            value={username}
            onChange={handleChange(setUsername, 'username')}
            error={Boolean(errors.username)}
            helperText={errors.username}
            autoComplete="username"
            autoFocus
            fullWidth
            margin="normal"
          />
          <TextField
            label="Password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={handleChange(setPassword, 'password')}
            error={Boolean(errors.password)}
            helperText={errors.password}
            autoComplete="current-password"
            fullWidth
            margin="normal"
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword((prev) => !prev)}
                      edge="end"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />
          <Button type="submit" variant="contained" size="large" fullWidth sx={{ mt: 2 }}>
            Sign in
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default Login;
