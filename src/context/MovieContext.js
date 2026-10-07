import { createContext, useCallback, useContext, useMemo, useReducer } from 'react';
import axios from 'axios';
import { getTrendingMovies } from '../api/tmdb';

const MovieContext = createContext(null);

// Shape of every paginated movie list kept in state
const initialListState = {
  items: [],
  page: 0,
  totalPages: 0,
  loading: false,
  error: null,
};

const initialState = {
  trending: initialListState,
};

export const ACTIONS = {
  TRENDING_REQUEST: 'TRENDING_REQUEST',
  TRENDING_SUCCESS: 'TRENDING_SUCCESS',
  TRENDING_FAILURE: 'TRENDING_FAILURE',
};

export const movieReducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.TRENDING_REQUEST:
      return { ...state, trending: { ...state.trending, loading: true, error: null } };

    case ACTIONS.TRENDING_SUCCESS: {
      const { results, page, total_pages: totalPages } = action.payload;
      // Page 1 replaces the list, later pages are appended
      const items = page === 1 ? results : [...state.trending.items, ...results];
      return {
        ...state,
        trending: { items, page, totalPages, loading: false, error: null },
      };
    }

    case ACTIONS.TRENDING_FAILURE:
      return { ...state, trending: { ...state.trending, loading: false, error: action.payload } };

    default:
      return state;
  }
};

// Holds all movie data for the app and exposes functions to load it
export const MovieProvider = ({ children }) => {
  const [state, dispatch] = useReducer(movieReducer, initialState);

  // Loads one page of trending movies. An AbortSignal can be passed so the
  // request is cancelled if the component that started it unmounts.
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

  const value = useMemo(() => ({ ...state, fetchTrending }), [state, fetchTrending]);

  return <MovieContext.Provider value={value}>{children}</MovieContext.Provider>;
};

export const useMovies = () => {
  const context = useContext(MovieContext);
  if (!context) {
    throw new Error('useMovies must be used inside a MovieProvider');
  }
  return context;
};
