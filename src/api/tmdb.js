import axios from 'axios';
import { TMDB_BASE_URL, TMDB_IMAGE_BASE_URL, POSTER_SIZE } from '../utils/constants';
import { getErrorMessage } from './errors';

export const MISSING_API_KEY_MESSAGE =
  'The TMDb API key is missing. Add REACT_APP_TMDB_API_KEY to your .env file and restart the app.';

// True when an API key has been provided in the environment
export const isApiKeyConfigured = () => Boolean(process.env.REACT_APP_TMDB_API_KEY);

// Shared axios instance for every TMDb request
const tmdb = axios.create({
  baseURL: TMDB_BASE_URL,
  timeout: 10000,
  params: { language: 'en-US' },
});

// Attach the API key to every request, or stop early if it is missing
// so the user gets a clear message instead of a confusing 401
tmdb.interceptors.request.use((config) => {
  if (!isApiKeyConfigured()) {
    const error = new Error(MISSING_API_KEY_MESSAGE);
    error.userMessage = MISSING_API_KEY_MESSAGE;
    return Promise.reject(error);
  }
  return {
    ...config,
    params: { ...config.params, api_key: process.env.REACT_APP_TMDB_API_KEY },
  };
});

// Add a friendly explanation to every failed response
tmdb.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!axios.isCancel(error)) {
      error.userMessage = getErrorMessage(error);
    }
    return Promise.reject(error);
  }
);

// Trending movies for the week (paginated)
export const getTrendingMovies = async (page = 1, signal) => {
  const { data } = await tmdb.get('/trending/movie/week', { params: { page }, signal });
  return data;
};

// Search movies by title (paginated)
export const searchMovies = async (query, page = 1, signal) => {
  const { data } = await tmdb.get('/search/movie', {
    params: { query, page, include_adult: false },
    signal,
  });
  return data;
};

// Full movie details, including cast and videos in a single request
export const getMovieDetails = async (movieId, signal) => {
  const { data } = await tmdb.get(`/movie/${movieId}`, {
    params: { append_to_response: 'credits,videos' },
    signal,
  });
  return data;
};

// The official list of movie genres, used for the genre filter
export const getGenres = async (signal) => {
  const { data } = await tmdb.get('/genre/movie/list', { signal });
  return data.genres;
};

// Minimum number of votes before a rating filter counts a movie,
// so a film with a single 10/10 vote does not top the results
const MIN_VOTES_FOR_RATING_FILTER = 50;

// Browse movies by genre, release year and minimum rating (paginated).
// `filters` is { genre, year, minRating }; empty values are ignored.
export const discoverMovies = async (filters, page = 1, signal) => {
  const params = { page, sort_by: 'popularity.desc', include_adult: false };

  if (filters.genre) params.with_genres = filters.genre;
  if (filters.year) params.primary_release_year = filters.year;
  if (filters.minRating > 0) {
    params['vote_average.gte'] = filters.minRating;
    params['vote_count.gte'] = MIN_VOTES_FOR_RATING_FILTER;
  }

  const { data } = await tmdb.get('/discover/movie', { params, signal });
  return data;
};

// Builds a full image URL from a TMDb image path, or returns null if there is no image
export const getImageUrl = (path, size = POSTER_SIZE) =>
  path ? `${TMDB_IMAGE_BASE_URL}/${size}${path}` : null;

export default tmdb;
