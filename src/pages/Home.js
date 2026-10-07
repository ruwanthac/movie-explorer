import { useEffect, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import SearchIcon from '@mui/icons-material/Search';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import MovieGrid from '../components/MovieGrid';
import SearchBar from '../components/SearchBar';
import useDebounce from '../hooks/useDebounce';
import { useMovies } from '../context/MovieContext';

const SEARCH_DELAY_MS = 500;

// Heading row used above each list of movies
const SectionHeader = ({ id, icon, title, subtitle }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, flexWrap: 'wrap' }}>
    {icon}
    <Typography id={id} variant="h6" component="h2" sx={{ fontWeight: 700, wordBreak: 'break-word' }}>
      {title}
    </Typography>
    {subtitle && (
      <Typography variant="body2" color="text.secondary">
        {subtitle}
      </Typography>
    )}
  </Box>
);

const ErrorAlert = ({ message, onRetry }) => (
  <Alert
    severity="error"
    action={
      <Button color="inherit" size="small" onClick={onRetry}>
        Retry
      </Button>
    }
  >
    {message}
  </Alert>
);

// Home page - movie search plus this week's trending movies
const Home = () => {
  const { trending, search, fetchTrending, searchMovies, clearSearch } = useMovies();

  // The input starts with the last search, restored from localStorage
  const [input, setInput] = useState(search.query);
  const debouncedQuery = useDebounce(input.trim(), SEARCH_DELAY_MS);

  // The in-flight search request, so it can be cancelled when a newer one starts
  const searchControllerRef = useRef(null);

  // Load the first page of trending movies once
  useEffect(() => {
    if (trending.page > 0) return undefined;
    const controller = new AbortController();
    fetchTrending(1, controller.signal);
    return () => controller.abort();
  }, [trending.page, fetchTrending]);

  // Search when the user pauses typing
  useEffect(() => {
    // Still typing - wait for the debounced value to catch up
    if (debouncedQuery !== input.trim()) return;

    if (!debouncedQuery) {
      if (search.query) clearSearch();
      return;
    }

    // This term is already loaded, loading, or failed (failed searches are
    // retried with the Retry button, not automatically)
    if (debouncedQuery === search.query && (search.page > 0 || search.loading || search.error)) return;

    // Cancel the previous request so results never arrive out of order
    searchControllerRef.current?.abort();
    searchControllerRef.current = new AbortController();
    searchMovies(debouncedQuery, 1, searchControllerRef.current.signal);
  }, [debouncedQuery, input, search.query, search.page, search.loading, search.error, searchMovies, clearSearch]);

  // Cancel any pending search when leaving the page
  useEffect(() => () => searchControllerRef.current?.abort(), []);

  const handleClear = () => {
    searchControllerRef.current?.abort();
    setInput('');
    clearSearch();
  };

  const isSearching = Boolean(search.query);
  const searchLoaded = search.page > 0 && !search.loading;
  const noResults = searchLoaded && !search.error && search.items.length === 0;

  return (
    <Box>
      <Typography
        variant="h4"
        component="h1"
        sx={{ fontWeight: 700, mb: 2, fontSize: { xs: '1.6rem', sm: '2.125rem' } }}
      >
        Discover your favorite films
      </Typography>

      <Box sx={{ mb: 4, maxWidth: 720 }}>
        <SearchBar value={input} onChange={setInput} onClear={handleClear} />
      </Box>

      {isSearching ? (
        <Box component="section" aria-labelledby="search-heading">
          <SectionHeader
            id="search-heading"
            icon={<SearchIcon color="primary" />}
            title={`Results for "${search.query}"`}
            subtitle={searchLoaded && !search.error ? `${search.totalResults.toLocaleString()} found` : null}
          />

          {search.error && (
            <ErrorAlert message={search.error} onRetry={() => searchMovies(search.query, 1)} />
          )}

          {noResults && (
            <Box sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
              <SearchOffIcon sx={{ fontSize: 56, mb: 1 }} />
              <Typography variant="h6" component="p">
                No movies found
              </Typography>
              <Typography variant="body2">Check the spelling or try a different title.</Typography>
            </Box>
          )}

          {!search.error && <MovieGrid movies={search.items} loading={search.loading || search.page === 0} />}
        </Box>
      ) : (
        <Box component="section" aria-labelledby="trending-heading">
          <SectionHeader
            id="trending-heading"
            icon={<WhatshotIcon color="error" />}
            title="Trending this week"
          />

          {trending.error ? (
            <ErrorAlert message={trending.error} onRetry={() => fetchTrending(1)} />
          ) : (
            <MovieGrid movies={trending.items} loading={trending.loading || trending.page === 0} />
          )}
        </Box>
      )}
    </Box>
  );
};

export default Home;
