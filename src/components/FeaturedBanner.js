import { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import StarIcon from '@mui/icons-material/Star';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import TrailerDialog from './TrailerDialog';
import { useMovies } from '../context/MovieContext';
import { getImageUrl } from '../api/tmdb';
import { BACKDROP_SIZE } from '../utils/constants';
import { formatRating, getReleaseYear, getTrailer } from '../utils/formatters';

const BANNER_HEIGHT = { xs: 320, sm: 400, md: 460 };

// Full-width banner featuring the #1 trending movie, with its backdrop,
// a short overview and buttons to watch the trailer or open the details page
const FeaturedBanner = ({ movie, loading }) => {
  const { details, fetchMovieDetails } = useMovies();
  const [trailerOpen, setTrailerOpen] = useState(false);

  // The trailer comes from the movie's details, which are cached for the details page too
  const movieId = movie?.id;
  const movieDetails = movieId ? details[movieId]?.data : null;
  const hasDetails = Boolean(movieDetails);

  useEffect(() => {
    if (!movieId || hasDetails) return undefined;
    const controller = new AbortController();
    fetchMovieDetails(String(movieId), controller.signal);
    return () => controller.abort();
  }, [movieId, hasDetails, fetchMovieDetails]);

  const frameSx = {
    position: 'relative',
    height: BANNER_HEIGHT,
    mx: { xs: -2, sm: 0 },
    mt: { xs: -2, sm: 0 },
    mb: 3,
    borderRadius: { xs: 0, sm: 4 },
    overflow: 'hidden',
  };

  if (loading && !movie) {
    return <Skeleton variant="rectangular" aria-hidden="true" sx={{ ...frameSx, height: BANNER_HEIGHT }} />;
  }

  const backdropUrl = movie && getImageUrl(movie.backdrop_path, BACKDROP_SIZE);
  // Without a backdrop the banner would look empty, so it is skipped
  if (!backdropUrl) return null;

  const trailer = getTrailer(movieDetails?.videos?.results);

  return (
    <Box
      component="section"
      aria-labelledby="featured-title"
      sx={{ ...frameSx, bgcolor: '#000', color: '#fff', animation: 'fadeInUp 0.5s ease both' }}
    >
      <Box
        component="img"
        src={backdropUrl}
        alt=""
        sx={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center 20%',
        }}
      />
      {/* Darkens the image towards the text so it is always readable */}
      <Box
        aria-hidden="true"
        sx={{
          position: 'absolute',
          inset: 0,
          background: {
            xs: 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.55) 45%, rgba(0,0,0,0.92) 100%)',
            md: 'linear-gradient(90deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.6) 45%, rgba(0,0,0,0.05) 80%), linear-gradient(0deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 40%)',
          },
        }}
      />

      <Box
        sx={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          p: { xs: 2.5, sm: 4, md: 5 },
          maxWidth: { md: 640 },
        }}
      >
        <Chip
          icon={<WhatshotIcon sx={{ color: '#ff7043 !important' }} />}
          label="#1 Trending this week"
          size="small"
          sx={{ mb: 1.5, color: '#fff', bgcolor: 'rgba(255, 255, 255, 0.16)', backdropFilter: 'blur(6px)' }}
        />
        <Typography
          id="featured-title"
          variant="h3"
          component="h2"
          sx={{ fontSize: { xs: '1.75rem', sm: '2.4rem', md: '2.9rem' }, lineHeight: 1.1, mb: 1 }}
        >
          {movie.title}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5, opacity: 0.9 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontWeight: 700 }}>
            <StarIcon sx={{ fontSize: 18, color: 'secondary.main' }} />
            {formatRating(movie.vote_average)}
          </Box>
          <Typography component="span" variant="body2">
            {getReleaseYear(movie.release_date)}
          </Typography>
        </Box>

        {movie.overview && (
          <Typography
            variant="body2"
            sx={{
              display: '-webkit-box',
              WebkitLineClamp: { xs: 2, sm: 3 },
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              mb: 2.5,
              opacity: 0.88,
              lineHeight: 1.6,
              fontSize: { sm: '0.95rem' },
            }}
          >
            {movie.overview}
          </Typography>
        )}

        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
          {trailer && (
            <Button
              variant="contained"
              size="large"
              startIcon={<PlayArrowIcon />}
              onClick={() => setTrailerOpen(true)}
              aria-haspopup="dialog"
              sx={{ bgcolor: '#fff', color: '#000', '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.85)' } }}
            >
              Watch trailer
            </Button>
          )}
          <Button
            component={RouterLink}
            to={`/movie/${movie.id}`}
            variant="contained"
            size="large"
            startIcon={<InfoOutlinedIcon />}
            sx={{
              bgcolor: 'rgba(255, 255, 255, 0.18)',
              color: '#fff',
              backdropFilter: 'blur(6px)',
              '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.28)' },
            }}
          >
            More info
          </Button>
        </Box>
      </Box>

      <TrailerDialog
        open={trailerOpen}
        onClose={() => setTrailerOpen(false)}
        trailer={trailer}
        movieTitle={movie.title}
      />
    </Box>
  );
};

export default FeaturedBanner;
