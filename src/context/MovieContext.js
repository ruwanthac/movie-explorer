import { createContext, useCallback, useContext, useMemo, useReducer } from 'react';
import axios from 'axios';
import { getTrendingMovies, searchMovies as searchMoviesApi } from '../api/tmdb';
import { getStoredItem, setStoredItem, removeStoredItem } from '../utils/storage';
import { STORAGE_KEYS } from '../utils/constants';

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

// The last search is restored from localStorage so it survives a page reload
const createInitialState = () => ({
  trending: initialListState,
  search: { ...initialListState, query: getStoredItem(STORAGE_KEYS.LAST_SEARCH, '') },
});

export const ACTIONS = {
  TRENDING_REQUEST: 'TRENDING_REQUEST',
  TRENDING_SUCCESS: 'TRENDING_SUCCESS',
  TRENDING_FAILURE: 'TRENDING_FAILURE',
  SEARCH_REQUEST: 'SEARCH_REQUEST',
  SEARCH_SUCCESS: 'SEARCH_SUCCESS',
  SEARCH_FAILURE: 'SEARCH_FAILURE',
  SEARCH_CLEAR: 'SEARCH_CLEAR',
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
    totalPages: data.total_pages,
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
        payload: 'Could not load trending movies. Please try again.',
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
        payload: { query, message: 'Could not load search results. Please try again.' },
      });
    }
  }, []);

  const clearSearch = useCallback(() => {
    dispatch({ type: ACTIONS.SEARCH_CLEAR });
    removeStoredItem(STORAGE_KEYS.LAST_SEARCH);
  }, []);

  const value = useMemo(
    () => ({ ...state, fetchTrending, searchMovies, clearSearch }),
    [state, fetchTrending, searchMovies, clearSearch]
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
