import { useEffect } from 'react';
import Box from '@mui/material/Box';
import { useMovies } from '../context/MovieContext';
import { getImageUrl } from '../api/tmdb';

const POSTER_COUNT = 24;

// Decorative, dimmed wall of trending movie posters used behind the login form.
// If the posters cannot be loaded, only the dark gradient is shown.
const PosterWall = () => {
  const { trending, fetchTrending } = useMovies();

  useEffect(() => {
    if (trending.page > 0) return undefined;
    const controller = new AbortController();
    fetchTrending(1, controller.signal);
    return () => controller.abort();
  }, [trending.page, fetchTrending]);

  const posters = trending.items
    .filter((movie) => movie.poster_path)
    .slice(0, POSTER_COUNT)
    .map((movie) => ({ id: movie.id, url: getImageUrl(movie.poster_path) }));

  return (
    <Box
      aria-hidden="true"
      sx={{ position: 'fixed', inset: 0, overflow: 'hidden', bgcolor: '#0b0d12', zIndex: 0 }}
    >
      <Box
        sx={{
          position: 'absolute',
          inset: '-10%',
          display: 'grid',
          gridTemplateColumns: { xs: 'repeat(4, 1fr)', sm: 'repeat(6, 1fr)', md: 'repeat(8, 1fr)' },
          gap: 1.5,
          transform: 'rotate(-8deg)',
          opacity: 0.45,
        }}
      >
        {posters.map((poster) => (
          <Box
            key={poster.id}
            component="img"
            src={poster.url}
            alt=""
            sx={{
              width: '100%',
              aspectRatio: '2 / 3',
              objectFit: 'cover',
              borderRadius: 2,
              animation: 'fadeInUp 0.6s ease both',
            }}
          />
        ))}
      </Box>
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle at center, rgba(11,13,18,0.55) 0%, rgba(11,13,18,0.92) 70%)',
        }}
      />
    </Box>
  );
};

export default PosterWall;
