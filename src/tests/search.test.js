import { screen, fireEvent } from '@testing-library/react';
import { getTrendingMovies, searchMovies } from '../api/tmdb';
import { renderAt, signIn, resetAppState } from '../testUtils/app';

jest.mock('../api/tmdb', () => require('../testUtils/tmdbMock').createTmdbMock());

beforeEach(resetAppState);

describe('movie search', () => {
  beforeEach(() => {
    signIn();
    jest.clearAllMocks();
    getTrendingMovies.mockResolvedValue({
      results: [{ id: 10, title: 'Trending Film', release_date: '2025-01-01', vote_average: 7 }],
      page: 1,
      total_pages: 1,
    });
  });

  const results = {
    results: [{ id: 27205, title: 'Inception', release_date: '2010-07-16', vote_average: 8.4 }],
    page: 1,
    total_pages: 1,
    total_results: 1,
  };

  const typeSearch = (text) =>
    fireEvent.change(screen.getByRole('searchbox', { name: /search movies/i }), { target: { value: text } });

  test('searches after the user stops typing and saves the term', async () => {
    searchMovies.mockResolvedValue(results);
    renderAt('/');
    await screen.findByText('Trending Film');

    // Quick typing sends only one request, for the final text
    typeSearch('inc');
    typeSearch('incep');
    typeSearch('inception');

    expect(await screen.findByRole('heading', { name: 'Inception' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /results for "inception"/i })).toBeInTheDocument();
    expect(screen.getByText('1 found')).toBeInTheDocument();
    expect(screen.queryByText('Trending Film')).not.toBeInTheDocument();

    expect(searchMovies).toHaveBeenCalledTimes(1);
    expect(searchMovies).toHaveBeenCalledWith('inception', 1, expect.anything());
    expect(JSON.parse(localStorage.getItem('movieExplorer.lastSearch'))).toBe('inception');
  });

  test('shows a message when nothing is found', async () => {
    searchMovies.mockResolvedValue({ results: [], page: 1, total_pages: 0, total_results: 0 });
    renderAt('/');

    typeSearch('zzzzqqq');
    expect(await screen.findByText(/no movies found/i)).toBeInTheDocument();
  });

  test('clearing the search shows trending movies again', async () => {
    searchMovies.mockResolvedValue(results);
    renderAt('/');

    typeSearch('inception');
    await screen.findByRole('heading', { name: 'Inception' });

    fireEvent.click(screen.getByRole('button', { name: /clear search/i }));
    expect(screen.getByText('Trending Film')).toBeInTheDocument();
    expect(screen.getByRole('searchbox', { name: /search movies/i })).toHaveValue('');
    expect(localStorage.getItem('movieExplorer.lastSearch')).toBeNull();
  });

  test('restores the last search when the app is opened again', async () => {
    localStorage.setItem('movieExplorer.lastSearch', JSON.stringify('inception'));
    searchMovies.mockResolvedValue(results);
    renderAt('/');

    expect(screen.getByRole('searchbox', { name: /search movies/i })).toHaveValue('inception');
    expect(await screen.findByRole('heading', { name: 'Inception' })).toBeInTheDocument();
  });

  test('shows an error with a retry button when search fails', async () => {
    searchMovies.mockRejectedValueOnce(new Error('Network Error'));
    renderAt('/');

    typeSearch('inception');
    expect(await screen.findByText(/could not load search results/i)).toBeInTheDocument();
    // A failed search is not retried automatically
    expect(searchMovies).toHaveBeenCalledTimes(1);

    searchMovies.mockResolvedValueOnce(results);
    fireEvent.click(screen.getByRole('button', { name: /retry/i }));
    expect(await screen.findByRole('heading', { name: 'Inception' })).toBeInTheDocument();
  });
});
