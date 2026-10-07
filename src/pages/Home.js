import { useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import MovieGrid from '../components/MovieGrid';
import { useMovies } from '../context/MovieContext';

// Home page - search (coming next) and this week's trending movies
const Home = () => {
  const { trending, fetchTrending } = useMovies();
  const { items, loading, error, page } = trending;

  // Load the first page of trending movies once; cancel if the user leaves the page
  useEffect(() => {
    if (page > 0) return undefined;
    const controller = new AbortController();
    fetchTrending(1, controller.signal);
    return () => controller.abort();
  }, [page, fetchTrending]);

  return (
    <Box>
      <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 3, fontSize: { xs: '1.6rem', sm: '2.125rem' } }}>
        Discover your favorite films
      </Typography>

      <Box component="section" aria-labelledby="trending-heading">
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <WhatshotIcon color="error" />
          <Typography id="trending-heading" variant="h6" component="h2" sx={{ fontWeight: 700 }}>
            Trending this week
          </Typography>
        </Box>

        {error ? (
          <Alert
            severity="error"
            action={
              <Button color="inherit" size="small" onClick={() => fetchTrending(1)}>
                Retry
              </Button>
            }
          >
            {error}
          </Alert>
        ) : (
          <MovieGrid movies={items} loading={loading || page === 0} />
        )}
      </Box>
    </Box>
  );
};

export default Home;
