import axios from 'axios';

// Turns a failed TMDb request into a short, friendly explanation.
// Returns null for cancelled requests, which are not real errors.
export const getErrorMessage = (error) => {
  if (axios.isCancel(error)) return null;
  if (error?.userMessage) return error.userMessage;

  const status = error?.response?.status;

  if (!error?.response) {
    if (error?.code === 'ECONNABORTED' || error?.code === 'ETIMEDOUT') {
      return 'The request took too long. Please try again.';
    }
    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      return 'You appear to be offline. Check your internet connection.';
    }
    return 'Could not reach the movie database. Check your connection and try again.';
  }

  if (status === 401) return 'The TMDb API key is invalid. Check REACT_APP_TMDB_API_KEY.';
  if (status === 404) return 'The requested movie could not be found.';
  if (status === 429) return 'Too many requests. Please wait a moment and try again.';
  if (status >= 500) return 'The movie database is having problems right now. Please try again later.';

  return 'Something went wrong. Please try again.';
};

// Combines what failed with why, e.g.
// "Could not load trending movies. You appear to be offline. Check your internet connection."
export const describeError = (action, error) => `${action} ${getErrorMessage(error) || 'Please try again.'}`;
