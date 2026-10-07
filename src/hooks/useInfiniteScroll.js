import { useCallback, useEffect, useState } from 'react';

// Calls `onLoadMore` when a "sentinel" element near the bottom of a list
// scrolls into view. Returns a ref to attach to that element.
//
// The observer is recreated whenever loading finishes, so if the sentinel is
// still visible (e.g. on a tall screen) the next page loads straight away.
const useInfiniteScroll = ({ onLoadMore, hasMore, loading, enabled = true, rootMargin = '400px' }) => {
  const [sentinel, setSentinel] = useState(null);

  useEffect(() => {
    if (!enabled || !sentinel || !hasMore || loading) return undefined;
    // Older browsers without IntersectionObserver can still use the Load More button
    if (typeof IntersectionObserver === 'undefined') return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) onLoadMore();
      },
      { rootMargin }
    );
    observer.observe(sentinel);

    return () => observer.disconnect();
  }, [enabled, sentinel, hasMore, loading, onLoadMore, rootMargin]);

  // A callback ref, so the effect re-runs when the sentinel element mounts
  return useCallback((node) => setSentinel(node), []);
};

export default useInfiniteScroll;
