import { useEffect, useState } from 'react';

// Returns `value` only after it has stopped changing for `delay` ms.
// Used so a search request is sent when the user pauses typing, not on every key.
const useDebounce = (value, delay = 500) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
};

export default useDebounce;
