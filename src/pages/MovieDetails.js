import { useEffect } from 'react';
import { Link as RouterLink, useLocation, useNavigate, useParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import StarIcon from '@mui/icons-material/Star';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import MovieIcon from '@mui/icons-material/Movie';
import SentimentDissatisfiedIcon from '@mui/icons-material/SentimentDissatisfied';
import CastList from '../components/CastList';
import ErrorMessage from '../components/ErrorMessage';
import FavoriteButton from '../components/FavoriteButton';
import MovieDetailsSkeleton from '../components/MovieDetailsSkeleton';
import { useMovies } from '../context/MovieContext';
import { getImageUrl } from '../api/tmdb';
import { BACKDROP_SIZE } from '../utils/constants';
import {
  formatRating,
  formatReleaseDate,
  formatRuntime,
  getReleaseYear,
  getTrailer,
  getYouTubeUrl,
} from '../utils/formatters';

// TMDb ids are positive whole numbers
const isValidId = (id) => /^\d+$/.test(id);

const NotFoundMessage = () => (
  <Box sx={{ textAlign: 'center', py: 8 }}>
    <SentimentDissatisfiedIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 1 }} />
    <Typography variant="h5" component="h1" gutterBottom>
      Movie not found
    </Typography>
    <Typography color="text.secondary" sx={{ mb: 3 }}>
      This movie does not exist or may have been removed.
    </Typography>
    <Button component={RouterLink} to="/" variant="contained">
      Back to home
    </Button>
  </Box>
);

// Full information about a single movie
const MovieDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { details, fetchMovieDetails } = useMovies();

  const entry = details[id];
  const movie = entry?.data;
  const validId = isValidId(id);
  const hasData = Boolean(movie);

  // Load the movie unless it is already cached from an earlier visit
  useEffect(() => {
    if (!validId || hasData) return undefined;
    const controller = new AbortController();
    fetchMovieDetails(id, controller.signal);
    return () => controller.abort();
  }, [id, validId, hasData, fetchMovieDetails]);

  // Go back to the previous page, or home if the details page was opened directly
  const handleBack = () => {
    if (location.key !== 'default') navigate(-1);
    else navigate('/');
  };

  const backButton = (
    <Button startIcon={<ArrowBackIcon />} onClick={handleBack} sx={{ mb: 2 }}>
      Back
    </Button>
  );

  if (!validId || entry?.notFound) {
    return <NotFoundMessage />;
  }

  if (entry?.error) {
    return (
      <Box>
        {backButton}
        <ErrorMessage message={entry.error} onRetry={() => fetchMovieDetails(id)} />
      </Box>
    );
  }

  if (!movie) {
    return (
      <Box>
        {backButton}
        <MovieDetailsSkeleton />
      </Box>
    );
  }

  const posterUrl = getImageUrl(movie.poster_path);
  const backdropUrl = getImageUrl(movie.backdrop_path, BACKDROP_SIZE);
  const trailer = getTrailer(movie.videos?.results);
  const runtime = formatRuntime(movie.runtime);
  const releaseDate = formatReleaseDate(movie.release_date);
  const year = getReleaseYear(movie.release_date);

  return (
    <Box>
      {backButton}

      {/* Hero: blurred backdrop behind the poster and main information */}
      <Box
        sx={{
          position: 'relative',
          borderRadius: 3,
          overflow: 'hidden',
          mx: { xs: -2, sm: 0 },
          color: backdropUrl ? '#fff' : 'text.primary',
          bgcolor: backdropUrl ? '#000' : 'background.paper',
        }}
      >
        {backdropUrl && (
          <Box
            aria-hidden="true"
            sx={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `url(${backdropUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center top',
              opacity: 0.35,
            }}
          />
        )}

        <Box
          sx={{
            position: 'relative',
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'center', sm: 'flex-start' },
            gap: { xs: 2, sm: 4 },
            p: { xs: 2, sm: 4 },
          }}
        >
          {posterUrl ? (
            <Box
              component="img"
              src={posterUrl}
              alt={`${movie.title} poster`}
              sx={{
                width: { xs: 180, sm: 240, md: 280 },
                aspectRatio: '2 / 3',
                objectFit: 'cover',
                borderRadius: 2,
                boxShadow: 6,
                flexShrink: 0,
              }}
            />
          ) : (
            <Box
              role="img"
              aria-label={`${movie.title} has no poster`}
              sx={{
                width: { xs: 180, sm: 240, md: 280 },
                aspectRatio: '2 / 3',
                borderRadius: 2,
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'action.hover',
              }}
            >
              <MovieIcon sx={{ fontSize: 64, opacity: 0.5 }} />
            </Box>
          )}

          <Box sx={{ flexGrow: 1, textAlign: { xs: 'center', sm: 'left' } }}>
            <Typography
              variant="h3"
              component="h1"
              sx={{ fontWeight: 700, fontSize: { xs: '1.75rem', sm: '2.25rem', md: '2.75rem' } }}
            >
              {movie.title}{' '}
              <Box component="span" sx={{ fontWeight: 400, opacity: 0.7 }}>
                ({year})
              </Box>
            </Typography>

            {movie.tagline && (
              <Typography variant="subtitle1" sx={{ fontStyle: 'italic', opacity: 0.85, mt: 0.5 }}>
                {movie.tagline}
              </Typography>
            )}

            {/* Rating, release date and runtime */}
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: { xs: 'center', sm: 'flex-start' },
                gap: { xs: 1, sm: 2 },
                mt: 2,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <StarIcon sx={{ color: 'secondary.main' }} />
                <Typography component="span" sx={{ fontWeight: 700 }}>
                  {formatRating(movie.vote_average)}
                </Typography>
                <Typography component="span" variant="body2" sx={{ opacity: 0.75 }}>
                  / 10 ({(movie.vote_count || 0).toLocaleString()} votes)
                </Typography>
              </Box>
              {releaseDate && <Typography variant="body2">{releaseDate}</Typography>}
              {runtime && <Typography variant="body2">{runtime}</Typography>}
            </Box>

            {movie.genres?.length > 0 && (
              <Box
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 1,
                  mt: 2,
                  justifyContent: { xs: 'center', sm: 'flex-start' },
                }}
              >
                {movie.genres.map((genre) => (
                  <Chip
                    key={genre.id}
                    label={genre.name}
                    size="small"
                    sx={backdropUrl ? { color: '#fff', borderColor: 'rgba(255,255,255,0.6)' } : undefined}
                    variant="outlined"
                  />
                ))}
              </Box>
            )}

            <Typography variant="h6" component="h2" sx={{ mt: 3, mb: 1, fontWeight: 700 }}>
              Overview
            </Typography>
            <Typography sx={{ lineHeight: 1.7, maxWidth: 800, mx: { xs: 'auto', sm: 0 } }}>
              {movie.overview || 'No overview available.'}
            </Typography>

            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 1.5,
                mt: 3,
                justifyContent: { xs: 'center', sm: 'flex-start' },
              }}
            >
              {trailer && (
                <Button
                  variant="contained"
                  color="error"
                  startIcon={<PlayArrowIcon />}
                  href={getYouTubeUrl(trailer.key)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Watch trailer
                </Button>
              )}
              <FavoriteButton
                movie={movie}
                variant="button"
                sx={backdropUrl ? { bgcolor: 'rgba(0, 0, 0, 0.4)' } : undefined}
              />
            </Box>
          </Box>
        </Box>
      </Box>

      <Divider sx={{ my: 4 }} />

      <Box component="section" aria-labelledby="cast-heading">
        <Typography id="cast-heading" variant="h6" component="h2" sx={{ fontWeight: 700, mb: 2 }}>
          Cast
        </Typography>
        <CastList cast={movie.credits?.cast} />
      </Box>
    </Box>
  );
};

export default MovieDetails;
