import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { useMovies } from '../context/MovieContext';
import { useNotification } from '../context/NotificationContext';

// Heart button that adds or removes a movie from favorites.
// variant="icon" is used on movie cards, variant="button" on the details page.
const FavoriteButton = ({ movie, variant = 'icon', sx }) => {
  const { isFavorite, addFavorite, removeFavorite } = useMovies();
  const { notify } = useNotification();
  const saved = isFavorite(movie.id);
  const label = saved ? `Remove ${movie.title} from favorites` : `Add ${movie.title} to favorites`;

  const handleClick = (event) => {
    // Cards are links - don't open the movie when the heart is clicked
    event.preventDefault();
    event.stopPropagation();

    if (saved) {
      removeFavorite(movie.id);
      notify(`Removed "${movie.title}" from favorites`, 'info');
    } else {
      addFavorite(movie);
      notify(`Added "${movie.title}" to favorites`);
    }
  };

  const icon = saved ? <FavoriteIcon /> : <FavoriteBorderIcon />;

  if (variant === 'button') {
    return (
      <Button
        variant={saved ? 'contained' : 'outlined'}
        color="error"
        startIcon={icon}
        onClick={handleClick}
        aria-pressed={saved}
        aria-label={label}
        sx={sx}
      >
        {saved ? 'In favorites' : 'Add to favorites'}
      </Button>
    );
  }

  return (
    <Tooltip title={saved ? 'Remove from favorites' : 'Add to favorites'}>
      <IconButton
        onClick={handleClick}
        aria-pressed={saved}
        aria-label={label}
        size="small"
        sx={{
          color: saved ? 'error.main' : '#fff',
          bgcolor: 'rgba(0, 0, 0, 0.55)',
          '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.75)' },
          ...sx,
        }}
      >
        {icon}
      </IconButton>
    </Tooltip>
  );
};

export default FavoriteButton;
