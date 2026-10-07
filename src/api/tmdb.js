import axios from 'axios';
import { TMDB_BASE_URL, TMDB_IMAGE_BASE_URL, POSTER_SIZE } from '../utils/constants';

// Shared axios instance for every TMDb request.
// The API key is read from .env and attached to each request as a query param.
const tmdb = axios.create({
  baseURL: TMDB_BASE_URL,
  timeout: 10000,
  params: {
    api_key: process.env.REACT_APP_TMDB_API_KEY,
    language: 'en-US',
  },
});

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

// Builds a full image URL from a TMDb image path, or returns null if there is no image
export const getImageUrl = (path, size = POSTER_SIZE) =>
  path ? `${TMDB_IMAGE_BASE_URL}/${size}${path}` : null;

export default tmdb;
