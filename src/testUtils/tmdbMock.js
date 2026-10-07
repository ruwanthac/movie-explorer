// Replacement for src/api/tmdb.js in app tests: network calls become jest.fn()
// mocks, while pure helpers (image URLs, API key check) keep working.
// Used as: jest.mock('../api/tmdb', () => require('../testUtils/tmdbMock').createTmdbMock());
export const createTmdbMock = () => ({
  ...jest.requireActual('../api/tmdb'),
  getTrendingMovies: jest.fn(),
  searchMovies: jest.fn(),
  getMovieDetails: jest.fn(),
  getGenres: jest.fn(),
  discoverMovies: jest.fn(),
});
