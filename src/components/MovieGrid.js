import Box from '@mui/material/Box';
import MovieCard from './MovieCard';
import MovieCardSkeleton from './MovieCardSkeleton';

// Responsive grid of movie cards.
// Columns adjust automatically: 2 on small phones up to 6+ on wide screens.
// While loading, skeleton cards are added after any movies already shown.
const MovieGrid = ({ movies = [], loading = false, skeletonCount = 12 }) => (
  <Box
    sx={{
      display: 'grid',
      gap: { xs: 1.5, sm: 2 },
      gridTemplateColumns: {
        xs: 'repeat(2, minmax(0, 1fr))',
        sm: 'repeat(auto-fill, minmax(160px, 1fr))',
        md: 'repeat(auto-fill, minmax(180px, 1fr))',
      },
    }}
  >
    {movies.map((movie) => (
      <MovieCard key={movie.id} movie={movie} />
    ))}
    {loading &&
      Array.from({ length: skeletonCount }, (_, index) => <MovieCardSkeleton key={`skeleton-${index}`} />)}
  </Box>
);

export default MovieGrid;
