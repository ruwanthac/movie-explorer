import { Link as RouterLink } from 'react-router-dom';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import StarIcon from '@mui/icons-material/Star';
import MovieIcon from '@mui/icons-material/Movie';
import FavoriteButton from './FavoriteButton';
import { getImageUrl } from '../api/tmdb';
import { getReleaseYear, formatRating } from '../utils/formatters';

// Posters on TMDb use a 2:3 aspect ratio
const POSTER_RATIO = '2 / 3';

// A single movie in the grid: poster, title, release year, rating and a
// favorite button. The card links to the movie's details page.
const MovieCard = ({ movie }) => {
  const posterUrl = getImageUrl(movie.poster_path);
  const year = getReleaseYear(movie.release_date);

  return (
    <Card
      sx={{
        height: '100%',
        position: 'relative',
        animation: 'fadeInUp 0.35s ease both',
        transition: 'transform 0.25s ease, box-shadow 0.25s ease',
        // Lift the card and zoom the poster slightly on hover (mouse devices only)
        '@media (hover: hover)': {
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: (theme) =>
              theme.palette.mode === 'dark'
                ? '0 12px 28px rgba(0, 0, 0, 0.6)'
                : '0 12px 28px rgba(15, 23, 42, 0.18)',
          },
          '&:hover .movie-card-poster': { transform: 'scale(1.05)' },
        },
      }}
    >
      <CardActionArea
        component={RouterLink}
        to={`/movie/${movie.id}`}
        sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
      >
        {/* overflow hidden keeps the zoomed poster inside its frame */}
        <Box sx={{ overflow: 'hidden', aspectRatio: POSTER_RATIO }}>
          {posterUrl ? (
            <Box
              component="img"
              className="movie-card-poster"
              src={posterUrl}
              alt={`${movie.title} poster`}
              loading="lazy"
              sx={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
                transition: 'transform 0.4s ease',
              }}
            />
          ) : (
            // Placeholder for movies without a poster
            <Box
              role="img"
              aria-label={`${movie.title} has no poster`}
              sx={{
                aspectRatio: POSTER_RATIO,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'action.hover',
                color: 'text.disabled',
              }}
            >
              <MovieIcon sx={{ fontSize: 56 }} />
            </Box>
          )}
        </Box>

        {/* Rating badge in the top-right corner of the poster */}
        <Box
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            display: 'flex',
            alignItems: 'center',
            gap: 0.25,
            px: 0.75,
            py: 0.25,
            borderRadius: 999,
            // Frosted glass so the badge stays readable on any poster
            bgcolor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(6px)',
            color: '#fff',
            fontSize: '0.8rem',
            fontWeight: 700,
          }}
          aria-label={`Rating ${formatRating(movie.vote_average)}`}
        >
          <StarIcon sx={{ fontSize: 16, color: 'secondary.main' }} />
          {formatRating(movie.vote_average)}
        </Box>

        <CardContent sx={{ p: 1.5, flexGrow: 1 }}>
          <Typography
            variant="subtitle2"
            component="h3"
            title={movie.title}
            sx={{
              fontWeight: 600,
              lineHeight: 1.3,
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {movie.title}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {year}
          </Typography>
        </CardContent>
      </CardActionArea>

      {/* Kept outside the link so the heart is its own button */}
      <FavoriteButton movie={movie} sx={{ position: 'absolute', top: 6, left: 6 }} />
    </Card>
  );
};

export default MovieCard;
