import { movieReducer, ACTIONS, countActiveFilters, EMPTY_FILTERS } from './MovieContext';

const emptyList = { items: [], page: 0, totalPages: 0, totalResults: 0, loading: false, error: null };
const baseState = {
  trending: emptyList,
  search: { ...emptyList, query: '' },
  filters: EMPTY_FILTERS,
  discover: emptyList,
};

const page = (number, ids) => ({
  page: number,
  total_pages: 3,
  total_results: 60,
  results: ids.map((id) => ({ id, title: `Movie ${id}` })),
});

test('appends later pages without duplicate movies', () => {
  let state = movieReducer(baseState, { type: ACTIONS.TRENDING_SUCCESS, payload: page(1, [1, 2, 3]) });
  state = movieReducer(state, { type: ACTIONS.TRENDING_SUCCESS, payload: page(2, [3, 4]) });

  expect(state.trending.items.map((movie) => movie.id)).toEqual([1, 2, 3, 4]);
  expect(state.trending.page).toBe(2);
});

test('ignores search results for a term the user has already changed', () => {
  let state = movieReducer(baseState, { type: ACTIONS.SEARCH_REQUEST, payload: { query: 'bat', page: 1 } });
  state = movieReducer(state, { type: ACTIONS.SEARCH_REQUEST, payload: { query: 'batman', page: 1 } });

  // The slower response for "bat" arrives after the user typed "batman"
  state = movieReducer(state, { type: ACTIONS.SEARCH_SUCCESS, payload: { query: 'bat', data: page(1, [9]) } });

  expect(state.search.query).toBe('batman');
  expect(state.search.items).toEqual([]);
  expect(state.search.loading).toBe(true);
});

test('starting a new search term resets the previous results', () => {
  let state = movieReducer(baseState, { type: ACTIONS.SEARCH_REQUEST, payload: { query: 'bat', page: 1 } });
  state = movieReducer(state, { type: ACTIONS.SEARCH_SUCCESS, payload: { query: 'bat', data: page(1, [1, 2]) } });
  state = movieReducer(state, { type: ACTIONS.SEARCH_REQUEST, payload: { query: 'joker', page: 1 } });

  expect(state.search.items).toEqual([]);
  expect(state.search.page).toBe(0);
});

test('counts active filters', () => {
  expect(countActiveFilters(EMPTY_FILTERS)).toBe(0);
  expect(countActiveFilters({ genre: '28', year: '2010', minRating: 7 })).toBe(3);
  expect(countActiveFilters({ genre: '', year: '2010', minRating: 0 })).toBe(1);
});

test('ignores filtered results for filters the user has already changed', () => {
  const action = { genre: '28', year: '', minRating: 0 };
  const comedy = { genre: '35', year: '', minRating: 0 };
  const key = (filters) => JSON.stringify([filters.genre, filters.year, filters.minRating]);

  let state = movieReducer(baseState, { type: ACTIONS.FILTERS_SET, payload: action });
  state = movieReducer(state, { type: ACTIONS.FILTERS_SET, payload: comedy });
  state = movieReducer(state, {
    type: ACTIONS.DISCOVER_SUCCESS,
    payload: { key: key(action), data: page(1, [1, 2]) },
  });

  expect(state.discover.items).toEqual([]);
  expect(state.filters).toEqual(comedy);
});
