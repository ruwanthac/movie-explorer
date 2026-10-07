import { useCallback, useEffect, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import SearchIcon from '@mui/icons-material/Search';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import PaginatedMovieGrid from '../components/PaginatedMovieGrid';
import PaginationModeToggle from '../components/PaginationModeToggle';
import SearchBar from '../components/SearchBar';
import useDebounce from '../hooks/useDebounce';
import usePaginationMode from '../hooks/usePaginationMode';
import { useMovies } from '../context/MovieContext';

const SEARCH_DELAY_MS = 500;

// Heading row used above each list of movies, with optional controls on the right
const SectionHeader = ({ id, icon, title, subtitle, action }) => (
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
    {action && <Box sx={{ ml: 'auto' }}>{action}</Box>}
  </Box>
);

const NoResults = () => (
  <Box sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
    <SearchOffIcon sx={{ fontSize: 56, mb: 1 }} />
    <Typography variant="h6" component="p">
      No movies found
    </Typography>
    <Typography variant="body2">Check the spelling or try a different title.</Typography>
  </Box>
);

// Home page - movie search plus this week's trending movies
const Home = () => {
  const { trending, search, fetchTrending, searchMovies, clearSearch } = useMovies();

  // The input starts with the last search, restored from localStorage
  const [input, setInput] = useState(search.query);
  const debouncedQuery = useDebounce(input.trim(), SEARCH_DELAY_MS);

  const [paginationMode, setPaginationMode] = usePaginationMode();

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

  const loadMoreSearch = useCallback(
    () => searchMovies(search.query, search.page + 1),
    [searchMovies, search.query, search.page]
  );
  const loadMoreTrending = useCallback(
    () => fetchTrending(trending.page + 1),
    [fetchTrending, trending.page]
  );

  const isSearching = Boolean(search.query);
  const searchLoaded = search.page > 0 && !search.loading;
  const modeToggle = <PaginationModeToggle mode={paginationMode} onChange={setPaginationMode} />;

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
            action={modeToggle}
          />
          <PaginatedMovieGrid
            list={search}
            mode={paginationMode}
            onLoadMore={loadMoreSearch}
            onRetry={() => searchMovies(search.query, 1)}
            emptyState={<NoResults />}
          />
        </Box>
      ) : (
        <Box component="section" aria-labelledby="trending-heading">
          <SectionHeader
            id="trending-heading"
            icon={<WhatshotIcon color="error" />}
            title="Trending this week"
            action={modeToggle}
          />
          <PaginatedMovieGrid
            list={trending}
            mode={paginationMode}
            onLoadMore={loadMoreTrending}
            onRetry={() => fetchTrending(1)}
          />
        </Box>
      )}
    </Box>
  );
};

export default Home;
