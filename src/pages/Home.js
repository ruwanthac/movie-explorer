import { useCallback, useEffect, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Badge from '@mui/material/Badge';
import Collapse from '@mui/material/Collapse';
import TuneIcon from '@mui/icons-material/Tune';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import SearchIcon from '@mui/icons-material/Search';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import PaginatedMovieGrid from '../components/PaginatedMovieGrid';
import PaginationModeToggle from '../components/PaginationModeToggle';
import FilterPanel from '../components/FilterPanel';
import SearchBar from '../components/SearchBar';
import useDebounce from '../hooks/useDebounce';
import usePaginationMode from '../hooks/usePaginationMode';
import { countActiveFilters, EMPTY_FILTERS, useMovies } from '../context/MovieContext';

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

const NoResults = ({ title = 'No movies found', hint, action }) => (
  <Box sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
    <SearchOffIcon sx={{ fontSize: 56, mb: 1 }} />
    <Typography variant="h6" component="p">
      {title}
    </Typography>
    <Typography variant="body2">{hint}</Typography>
    {action && <Box sx={{ mt: 2 }}>{action}</Box>}
  </Box>
);

// Home page - movie search plus this week's trending movies
const Home = () => {
  const {
    trending,
    search,
    filters,
    discover,
    genres,
    fetchTrending,
    searchMovies,
    clearSearch,
    setFilters,
    discoverMovies,
    fetchGenres,
  } = useMovies();

  // The input starts with the last search, restored from localStorage
  const [input, setInput] = useState(search.query);
  const debouncedQuery = useDebounce(input.trim(), SEARCH_DELAY_MS);

  const [paginationMode, setPaginationMode] = usePaginationMode();

  // The in-flight search / filter requests, so they can be cancelled when a newer one starts
  const searchControllerRef = useRef(null);
  const discoverControllerRef = useRef(null);

  const activeFilterCount = countActiveFilters(filters);
  const filtersActive = activeFilterCount > 0;
  // The panel starts open if filters were already set (e.g. coming back from a movie)
  const [filtersOpen, setFiltersOpen] = useState(filtersActive);

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

  // Load the genre list for the filter once
  const needGenres = genres.items.length === 0 && !genres.error;
  useEffect(() => {
    if (!needGenres) return undefined;
    const controller = new AbortController();
    fetchGenres(controller.signal);
    return () => controller.abort();
  }, [needGenres, fetchGenres]);

  // Load the first page of filtered movies whenever the filters change
  useEffect(() => {
    if (!filtersActive || discover.page > 0 || discover.loading || discover.error) return;
    discoverControllerRef.current?.abort();
    discoverControllerRef.current = new AbortController();
    discoverMovies(filters, 1, discoverControllerRef.current.signal);
  }, [filtersActive, filters, discover.page, discover.loading, discover.error, discoverMovies]);

  // Cancel any pending requests when leaving the page
  useEffect(
    () => () => {
      searchControllerRef.current?.abort();
      discoverControllerRef.current?.abort();
    },
    []
  );

  const handleClear = () => {
    searchControllerRef.current?.abort();
    setInput('');
    clearSearch();
  };

  const loadMoreSearch = useCallback(
    () => searchMovies(search.query, search.page + 1),
    [searchMovies, search.query, search.page]
  );
  const loadMoreDiscover = useCallback(
    () => discoverMovies(filters, discover.page + 1),
    [discoverMovies, filters, discover.page]
  );
  const loadMoreTrending = useCallback(
    () => fetchTrending(trending.page + 1),
    [fetchTrending, trending.page]
  );

  const isSearching = Boolean(search.query);
  const searchLoaded = search.page > 0 && !search.loading;
  const modeToggle = <PaginationModeToggle mode={paginationMode} onChange={setPaginationMode} />;

  // Short summary of the active filters, e.g. "Action · 2010 · 7+ rating"
  const genreName = genres.items.find((genre) => String(genre.id) === filters.genre)?.name;
  const filterSummary = [
    genreName,
    filters.year,
    filters.minRating > 0 ? `${filters.minRating}+ rating` : null,
  ]
    .filter(Boolean)
    .join(' · ');
  const discoverLoaded = discover.page > 0 && !discover.loading && !discover.error;

  const clearFiltersButton = (
    <Button variant="outlined" startIcon={<FilterAltOffIcon />} onClick={() => setFilters(EMPTY_FILTERS)}>
      Clear filters
    </Button>
  );

  return (
    <Box>
      <Typography
        variant="h4"
        component="h1"
        sx={{ fontWeight: 700, mb: 2, fontSize: { xs: '1.6rem', sm: '2.125rem' } }}
      >
        Discover your favorite films
      </Typography>

      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', maxWidth: 860, mb: filtersOpen && !isSearching ? 2 : 4 }}>
        <Box sx={{ flexGrow: 1 }}>
          <SearchBar value={input} onChange={setInput} onClear={handleClear} />
        </Box>

        {/* TMDb search cannot be filtered, so filters are only offered when browsing */}
        {!isSearching && (
          <Button
            variant={filtersOpen ? 'contained' : 'outlined'}
            onClick={() => setFiltersOpen((open) => !open)}
            aria-expanded={filtersOpen}
            aria-controls="filter-panel"
            aria-label={`Filters${filtersActive ? ` (${activeFilterCount} active)` : ''}`}
            sx={{ height: 56, flexShrink: 0, minWidth: { xs: 56, sm: 'auto' }, px: { xs: 1.5, sm: 2 } }}
          >
            <Badge badgeContent={activeFilterCount} color="error">
              <TuneIcon />
            </Badge>
            <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' }, ml: 1 }}>
              Filters
            </Box>
          </Button>
        )}
      </Box>

      {!isSearching && (
        <Collapse in={filtersOpen} id="filter-panel">
          <Box sx={{ mb: 4 }}>
            <FilterPanel
              filters={filters}
              onChange={setFilters}
              genres={genres.items}
              genresLoading={genres.loading}
              genresError={genres.error}
              onRetryGenres={() => fetchGenres()}
            />
          </Box>
        </Collapse>
      )}

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
            emptyState={<NoResults hint="Check the spelling or try a different title." />}
          />
        </Box>
      ) : filtersActive ? (
        <Box component="section" aria-labelledby="filtered-heading">
          <SectionHeader
            id="filtered-heading"
            icon={<FilterAltIcon color="primary" />}
            title="Filtered movies"
            subtitle={[filterSummary, discoverLoaded ? `${discover.totalResults.toLocaleString()} found` : null]
              .filter(Boolean)
              .join(' · ')}
            action={modeToggle}
          />
          <PaginatedMovieGrid
            list={discover}
            mode={paginationMode}
            onLoadMore={loadMoreDiscover}
            onRetry={() => discoverMovies(filters, 1)}
            emptyState={
              <NoResults
                title="No movies match these filters"
                hint="Try a different genre or year, or lower the minimum rating."
                action={clearFiltersButton}
              />
            }
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
