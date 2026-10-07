import { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from 'react';
import axios from 'axios';
import {
  discoverMovies as discoverMoviesApi,
  getGenres,
  getMovieDetails,
  getTrendingMovies,
  searchMovies as searchMoviesApi,
} from '../api/tmdb';
import { describeError } from '../api/errors';
import { getStoredItem, setStoredItem, removeStoredItem } from '../utils/storage';
import { STORAGE_KEYS, TMDB_MAX_PAGES } from '../utils/constants';

const MovieContext = createContext(null);

// Shape of every paginated movie list kept in state
const initialListState = {
  items: [],
  page: 0,
  totalPages: 0,
  totalResults: 0,
  loading: false,
  error: null,
};

export const EMPTY_FILTERS = { genre: '', year: '', minRating: 0 };

// Number of filters the user has set, e.g. for a badge
export const countActiveFilters = (filters) =>
  [filters.genre, filters.year, filters.minRating > 0].filter(Boolean).length;

// A stable string for a set of filters, used to spot responses for old filters
const filtersKey = (filters) => JSON.stringify([filters.genre, filters.year, filters.minRating]);

// The last search is restored from localStorage so it survives a page reload
const createInitialState = () => ({
  trending: initialListState,
  search: { ...initialListState, query: getStoredItem(STORAGE_KEYS.LAST_SEARCH, '') },
  // Movie details cached by id: { data, loading, error, notFound }
  details: {},
  // Genre / year / rating filters and the movies that match them
  filters: EMPTY_FILTERS,
  discover: initialListState,
  genres: { items: [], loading: false, error: null },
  // Saved favorite movies, newest first
  favorites: getStoredItem(STORAGE_KEYS.FAVORITES, []),
});

// Only the fields needed to show a movie card are saved for favorites
const toFavorite = ({ id, title, poster_path, release_date, vote_average }) => ({
  id,
  title,
  poster_path,
  release_date,
  vote_average,
});

export const ACTIONS = {
  TRENDING_REQUEST: 'TRENDING_REQUEST',
  TRENDING_SUCCESS: 'TRENDING_SUCCESS',
  TRENDING_FAILURE: 'TRENDING_FAILURE',
  SEARCH_REQUEST: 'SEARCH_REQUEST',
  SEARCH_SUCCESS: 'SEARCH_SUCCESS',
  SEARCH_FAILURE: 'SEARCH_FAILURE',
  SEARCH_CLEAR: 'SEARCH_CLEAR',
  DETAILS_REQUEST: 'DETAILS_REQUEST',
  DETAILS_SUCCESS: 'DETAILS_SUCCESS',
  DETAILS_FAILURE: 'DETAILS_FAILURE',
  FILTERS_SET: 'FILTERS_SET',
  DISCOVER_REQUEST: 'DISCOVER_REQUEST',
  DISCOVER_SUCCESS: 'DISCOVER_SUCCESS',
  DISCOVER_FAILURE: 'DISCOVER_FAILURE',
  GENRES_REQUEST: 'GENRES_REQUEST',
  GENRES_SUCCESS: 'GENRES_SUCCESS',
  GENRES_FAILURE: 'GENRES_FAILURE',
  FAVORITE_ADD: 'FAVORITE_ADD',
  FAVORITE_REMOVE: 'FAVORITE_REMOVE',
  FAVORITES_CLEAR: 'FAVORITES_CLEAR',
};

// Merges one page of TMDb results into a list.
// Page 1 replaces the list; later pages are appended without duplicates.
const applyPage = (list, data) => {
  const existingIds = new Set(data.page === 1 ? [] : list.items.map((movie) => movie.id));
  const newItems = data.results.filter((movie) => !existingIds.has(movie.id));

  return {
    ...list,
    items: data.page === 1 ? newItems : [...list.items, ...newItems],
    page: data.page,
    totalPages: Math.min(data.total_pages, TMDB_MAX_PAGES),
    totalResults: data.total_results ?? 0,
    loading: false,
    error: null,
  };
};

export const movieReducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.TRENDING_REQUEST:
      return { ...state, trending: { ...state.trending, loading: true, error: null } };

    case ACTIONS.TRENDING_SUCCESS:
      return { ...state, trending: applyPage(state.trending, action.payload) };

    case ACTIONS.TRENDING_FAILURE:
      return { ...state, trending: { ...state.trending, loading: false, error: action.payload } };

    case ACTIONS.SEARCH_REQUEST: {
      const { query, page } = action.payload;
      // A new search term starts a fresh list
      const base = query === state.search.query && page > 1 ? state.search : { ...initialListState, query };
      return { ...state, search: { ...base, loading: true, error: null } };
    }

    case ACTIONS.SEARCH_SUCCESS:
      // Ignore late responses for a search term the user has already changed
      if (action.payload.query !== state.search.query) return state;
      return { ...state, search: { ...applyPage(state.search, action.payload.data), query: state.search.query } };

    case ACTIONS.SEARCH_FAILURE:
      if (action.payload.query !== state.search.query) return state;
      return { ...state, search: { ...state.search, loading: false, error: action.payload.message } };

    case ACTIONS.SEARCH_CLEAR:
      return { ...state, search: { ...initialListState, query: '' } };

    case ACTIONS.DETAILS_REQUEST:
      return {
        ...state,
        details: {
          ...state.details,
          [action.payload.id]: { data: null, loading: true, error: null, notFound: false },
        },
      };

    case ACTIONS.DETAILS_SUCCESS:
      return {
        ...state,
        details: {
          ...state.details,
          [action.payload.id]: { data: action.payload.data, loading: false, error: null, notFound: false },
        },
      };

    case ACTIONS.DETAILS_FAILURE:
      return {
        ...state,
        details: {
          ...state.details,
          [action.payload.id]: {
            data: null,
            loading: false,
            error: action.payload.message,
            notFound: action.payload.notFound,
          },
        },
      };

    case ACTIONS.FILTERS_SET:
      // New filters start a fresh list of results
      return { ...state, filters: action.payload, discover: initialListState };

    case ACTIONS.DISCOVER_REQUEST:
      if (action.payload.key !== filtersKey(state.filters)) return state;
      return { ...state, discover: { ...state.discover, loading: true, error: null } };

    case ACTIONS.DISCOVER_SUCCESS:
      // Ignore late responses for filters the user has already changed
      if (action.payload.key !== filtersKey(state.filters)) return state;
      return { ...state, discover: applyPage(state.discover, action.payload.data) };

    case ACTIONS.DISCOVER_FAILURE:
      if (action.payload.key !== filtersKey(state.filters)) return state;
      return { ...state, discover: { ...state.discover, loading: false, error: action.payload.message } };

    case ACTIONS.GENRES_REQUEST:
      return { ...state, genres: { ...state.genres, loading: true, error: null } };

    case ACTIONS.GENRES_SUCCESS:
      return { ...state, genres: { items: action.payload, loading: false, error: null } };

    case ACTIONS.GENRES_FAILURE:
      return { ...state, genres: { ...state.genres, loading: false, error: action.payload } };

    case ACTIONS.FAVORITE_ADD:
      if (state.favorites.some((movie) => movie.id === action.payload.id)) return state;
      return { ...state, favorites: [toFavorite(action.payload), ...state.favorites] };

    case ACTIONS.FAVORITE_REMOVE:
      return { ...state, favorites: state.favorites.filter((movie) => movie.id !== action.payload) };

    case ACTIONS.FAVORITES_CLEAR:
      return { ...state, favorites: [] };

    default:
      return state;
  }
};

// Holds all movie data for the app and exposes functions to load it.
// Fetch functions accept an AbortSignal so a request is cancelled when the
// component that started it unmounts or starts a newer request.
export const MovieProvider = ({ children }) => {
  const [state, dispatch] = useReducer(movieReducer, undefined, createInitialState);

  const fetchTrending = useCallback(async (page = 1, signal) => {
    dispatch({ type: ACTIONS.TRENDING_REQUEST });
    try {
      const data = await getTrendingMovies(page, signal);
      dispatch({ type: ACTIONS.TRENDING_SUCCESS, payload: data });
    } catch (error) {
      if (axios.isCancel(error)) return;
      dispatch({
        type: ACTIONS.TRENDING_FAILURE,
        payload: describeError('Could not load trending movies.', error),
      });
    }
  }, []);

  const searchMovies = useCallback(async (query, page = 1, signal) => {
    dispatch({ type: ACTIONS.SEARCH_REQUEST, payload: { query, page } });
    setStoredItem(STORAGE_KEYS.LAST_SEARCH, query);
    try {
      const data = await searchMoviesApi(query, page, signal);
      dispatch({ type: ACTIONS.SEARCH_SUCCESS, payload: { query, data } });
    } catch (error) {
      if (axios.isCancel(error)) return;
      dispatch({
        type: ACTIONS.SEARCH_FAILURE,
        payload: { query, message: describeError('Could not load search results.', error) },
      });
    }
  }, []);

  // Loads full details (with cast and videos) for one movie
  const fetchMovieDetails = useCallback(async (id, signal) => {
    dispatch({ type: ACTIONS.DETAILS_REQUEST, payload: { id } });
    try {
      const data = await getMovieDetails(id, signal);
      dispatch({ type: ACTIONS.DETAILS_SUCCESS, payload: { id, data } });
    } catch (error) {
      if (axios.isCancel(error)) return;
      const notFound = error.response?.status === 404;
      dispatch({
        type: ACTIONS.DETAILS_FAILURE,
        payload: {
          id,
          notFound,
          message: notFound ? 'Movie not found.' : describeError('Could not load movie details.', error),
        },
      });
    }
  }, []);

  const clearSearch = useCallback(() => {
    dispatch({ type: ACTIONS.SEARCH_CLEAR });
    removeStoredItem(STORAGE_KEYS.LAST_SEARCH);
  }, []);

  const setFilters = useCallback((filters) => dispatch({ type: ACTIONS.FILTERS_SET, payload: filters }), []);

  // Loads one page of movies matching the given filters
  const discoverMovies = useCallback(async (filters, page = 1, signal) => {
    const key = filtersKey(filters);
    dispatch({ type: ACTIONS.DISCOVER_REQUEST, payload: { key } });
    try {
      const data = await discoverMoviesApi(filters, page, signal);
      dispatch({ type: ACTIONS.DISCOVER_SUCCESS, payload: { key, data } });
    } catch (error) {
      if (axios.isCancel(error)) return;
      dispatch({
        type: ACTIONS.DISCOVER_FAILURE,
        payload: { key, message: describeError('Could not load filtered movies.', error) },
      });
    }
  }, []);

  const fetchGenres = useCallback(async (signal) => {
    dispatch({ type: ACTIONS.GENRES_REQUEST });
    try {
      const genres = await getGenres(signal);
      dispatch({ type: ACTIONS.GENRES_SUCCESS, payload: genres });
    } catch (error) {
      if (axios.isCancel(error)) return;
      dispatch({ type: ACTIONS.GENRES_FAILURE, payload: 'Could not load genres.' });
    }
  }, []);

  // Keep favorites saved in localStorage whenever they change
  useEffect(() => {
    setStoredItem(STORAGE_KEYS.FAVORITES, state.favorites);
  }, [state.favorites]);

  // Fast lookup for "is this movie a favorite?" on every card
  const favoriteIds = useMemo(() => new Set(state.favorites.map((movie) => movie.id)), [state.favorites]);
  const isFavorite = useCallback((id) => favoriteIds.has(id), [favoriteIds]);

  const addFavorite = useCallback((movie) => dispatch({ type: ACTIONS.FAVORITE_ADD, payload: movie }), []);
  const removeFavorite = useCallback((id) => dispatch({ type: ACTIONS.FAVORITE_REMOVE, payload: id }), []);
  const clearFavorites = useCallback(() => dispatch({ type: ACTIONS.FAVORITES_CLEAR }), []);

  const value = useMemo(
    () => ({
      ...state,
      fetchTrending,
      searchMovies,
      clearSearch,
      fetchMovieDetails,
      setFilters,
      discoverMovies,
      fetchGenres,
      isFavorite,
      addFavorite,
      removeFavorite,
      clearFavorites,
    }),
    [
      state,
      fetchTrending,
      searchMovies,
      clearSearch,
      fetchMovieDetails,
      setFilters,
      discoverMovies,
      fetchGenres,
      isFavorite,
      addFavorite,
      removeFavorite,
      clearFavorites,
    ]
  );

  return <MovieContext.Provider value={value}>{children}</MovieContext.Provider>;
};

export const useMovies = () => {
  const context = useContext(MovieContext);
  if (!context) {
    throw new Error('useMovies must be used inside a MovieProvider');
  }
  return context;
};
