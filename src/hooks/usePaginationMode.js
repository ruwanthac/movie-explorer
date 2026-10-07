import { useEffect, useState } from 'react';
import { getStoredItem, setStoredItem } from '../utils/storage';
import { STORAGE_KEYS, PAGINATION_MODES } from '../utils/constants';

// The user's choice between infinite scroll and a "Load More" button,
// remembered across visits. Infinite scroll is the default.
const usePaginationMode = () => {
  const [mode, setMode] = useState(() => {
    const saved = getStoredItem(STORAGE_KEYS.PAGINATION_MODE);
    return Object.values(PAGINATION_MODES).includes(saved) ? saved : PAGINATION_MODES.SCROLL;
  });

  useEffect(() => {
    setStoredItem(STORAGE_KEYS.PAGINATION_MODE, mode);
  }, [mode]);

  return [mode, setMode];
};

export default usePaginationMode;
