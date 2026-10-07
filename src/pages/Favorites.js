import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import MovieGrid from '../components/MovieGrid';
import EmptyState from '../components/EmptyState';
import { useMovies } from '../context/MovieContext';
import { useNotification } from '../context/NotificationContext';
import useDocumentTitle from '../hooks/useDocumentTitle';

const EmptyFavorites = () => (
  <EmptyState
    icon={<FavoriteBorderIcon />}
    title="No favorites yet"
    hint="Tap the heart on any movie to save it here."
    action={
      <Button component={RouterLink} to="/" variant="contained" size="large">
        Discover movies
      </Button>
    }
  />
);

// Lists the movies the user has saved, stored in localStorage
const Favorites = () => {
  const { favorites, clearFavorites } = useMovies();
  const { notify } = useNotification();
  const [confirmOpen, setConfirmOpen] = useState(false);
  useDocumentTitle('My favorites');

  const handleClearAll = () => {
    clearFavorites();
    setConfirmOpen(false);
    notify('All favorites removed', 'info');
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3, flexWrap: 'wrap' }}>
        <FavoriteIcon color="error" />
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700, fontSize: { xs: '1.6rem', sm: '2.125rem' } }}>
          My favorites
        </Typography>
        {favorites.length > 0 && (
          <>
            <Typography color="text.secondary">
              ({favorites.length} {favorites.length === 1 ? 'movie' : 'movies'})
            </Typography>
            <Button
              color="error"
              startIcon={<DeleteSweepIcon />}
              onClick={() => setConfirmOpen(true)}
              sx={{ ml: 'auto' }}
            >
              Clear all
            </Button>
          </>
        )}
      </Box>

      {favorites.length === 0 ? <EmptyFavorites /> : <MovieGrid movies={favorites} />}

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} aria-labelledby="clear-favorites-title">
        <DialogTitle id="clear-favorites-title">Remove all favorites?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This will remove all {favorites.length} saved movies. This cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button onClick={handleClearAll} color="error" variant="contained">
            Remove all
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Favorites;
