import { render } from '@testing-library/react';
import App from '../App';
import { discoverMovies, getGenres, getMovieDetails, getTrendingMovies, searchMovies } from '../api/tmdb';

// Renders the whole app starting at the given URL
export const renderAt = (path) => {
  window.history.pushState({}, '', path);
  return render(<App />);
};

// Simulates a returning user who is already signed in
export const signIn = (username = 'ruwantha') => {
  localStorage.setItem('movieExplorer.user', JSON.stringify({ username }));
};

// Clears saved data and makes every TMDb request wait forever by default,
// so each test only resolves the requests it is interested in
export const resetAppState = () => {
  localStorage.clear();
  [getTrendingMovies, searchMovies, getMovieDetails, getGenres, discoverMovies].forEach((mock) => {
    mock.mockReset();
    mock.mockReturnValue(new Promise(() => {}));
  });
};
