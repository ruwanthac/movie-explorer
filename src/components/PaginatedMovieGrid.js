import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import MovieGrid from './MovieGrid';
import useInfiniteScroll from '../hooks/useInfiniteScroll';
import { PAGINATION_MODES } from '../utils/constants';

// A movie grid that loads more pages, either automatically on scroll or with
// a "Load More" button.
//
// `list` is a paginated list from MovieContext: { items, page, totalPages, loading, error }
// `onLoadMore` loads the next page; `onRetry` reloads the first page.
const PaginatedMovieGrid = ({ list, onLoadMore, onRetry, mode, emptyState = null }) => {
  const { items, page, totalPages, loading, error } = list;

  const hasMore = page > 0 && page < totalPages;
  const isFirstLoad = page === 0;
  const isEmpty = page > 0 && !loading && !error && items.length === 0;

  const sentinelRef = useInfiniteScroll({
    onLoadMore,
    hasMore,
    // Stop auto-loading after an error so a failing request is not repeated
    loading: loading || Boolean(error),
    enabled: mode === PAGINATION_MODES.SCROLL,
  });

  // Nothing loaded yet and the first request failed
  if (error && items.length === 0) {
    return (
      <Alert
        severity="error"
        action={
          <Button color="inherit" size="small" onClick={onRetry}>
            Retry
          </Button>
        }
      >
        {error}
      </Alert>
    );
  }

  if (isEmpty) return emptyState;

  return (
    <Box>
      {/* Skeletons fill the grid on the first load; later pages show a spinner instead */}
      <MovieGrid movies={items} loading={isFirstLoad} />

      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, py: 3 }}>
        {loading && !isFirstLoad && <CircularProgress size={32} aria-label="Loading more movies" />}

        {/* A later page failed - keep what is already shown and offer a retry */}
        {error && (
          <Alert
            severity="error"
            sx={{ width: '100%', maxWidth: 520 }}
            action={
              <Button color="inherit" size="small" onClick={onLoadMore}>
                Retry
              </Button>
            }
          >
            {error}
          </Alert>
        )}

        {mode === PAGINATION_MODES.BUTTON && hasMore && !loading && !error && (
          <Button variant="outlined" size="large" onClick={onLoadMore}>
            Load More
          </Button>
        )}

        {mode === PAGINATION_MODES.SCROLL && hasMore && (
          // Invisible marker - when it nears the viewport, the next page loads
          <Box ref={sentinelRef} data-testid="infinite-scroll-sentinel" sx={{ height: 1, width: '100%' }} />
        )}

        {!hasMore && page > 0 && items.length > 0 && (
          <Typography variant="body2" color="text.secondary">
            You&apos;ve reached the end
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default PaginatedMovieGrid;
