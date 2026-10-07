// Small wrappers around localStorage that never throw.
// localStorage can be unavailable (private mode, blocked storage), so the app
// falls back to the provided default instead of crashing.

export const getStoredItem = (key, fallback = null) => {
  try {
    const value = localStorage.getItem(key);
    return value !== null ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

export const setStoredItem = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore write errors - persistence is a convenience, not a requirement
  }
};

export const removeStoredItem = (key) => {
  try {
    localStorage.removeItem(key);
  } catch {
    // Ignore
  }
};
