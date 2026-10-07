// Base URLs for the TMDb API and its image CDN
export const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
export const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

// Image sizes used across the app (see TMDb /configuration for all options)
export const POSTER_SIZE = 'w342';
export const BACKDROP_SIZE = 'w1280';
export const PROFILE_SIZE = 'w185';

// Keys used to persist data in localStorage
export const STORAGE_KEYS = {
  USER: 'movieExplorer.user',
  THEME: 'movieExplorer.theme',
  LAST_SEARCH: 'movieExplorer.lastSearch',
  FAVORITES: 'movieExplorer.favorites',
};
