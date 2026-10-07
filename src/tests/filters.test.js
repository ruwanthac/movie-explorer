import { screen, fireEvent, within, waitFor } from '@testing-library/react';
import { getTrendingMovies, searchMovies, getGenres, discoverMovies } from '../api/tmdb';
import { renderAt, signIn, resetAppState } from '../testUtils/app';
import { scrollSentinelIntoView } from '../testUtils/intersectionObserver';

jest.mock('../api/tmdb', () => require('../testUtils/tmdbMock').createTmdbMock());

beforeEach(resetAppState);

describe('filters', () => {
  beforeEach(() => {
    signIn();
    jest.clearAllMocks();
    getTrendingMovies.mockResolvedValue({
      results: [{ id: 10, title: 'Trending Film', release_date: '2025-01-01', vote_average: 7 }],
      page: 1,
      total_pages: 1,
    });
    getGenres.mockResolvedValue([
      { id: 28, name: 'Action' },
      { id: 35, name: 'Comedy' },
    ]);
  });

  const filtered = (page = 1) => ({
    page,
    total_pages: 2,
    total_results: 35,
    results: [{ id: 27205 + page, title: `Filtered ${page}`, release_date: '2010-07-15', vote_average: 8.4 }],
  });

  // Renders Home and waits until trending movies and the genre list have loaded
  const renderHome = async () => {
    renderAt('/');
    await screen.findByText('Trending Film');
    fireEvent.click(screen.getByRole('button', { name: /^filters/i }));
    await waitFor(() => expect(screen.getByRole('combobox', { name: /genre/i })).not.toHaveAttribute('aria-disabled'));
  };

  // MUI Select opens a listbox when its button is pressed
  const choose = (label, option) => {
    fireEvent.mouseDown(screen.getByRole('combobox', { name: label }));
    fireEvent.click(within(screen.getByRole('listbox')).getByRole('option', { name: option }));
  };

  test('filters by genre and shows matching movies instead of trending', async () => {
    discoverMovies.mockResolvedValue(filtered());
    await renderHome();
    choose(/genre/i, 'Action');

    expect(await screen.findByText('Filtered 1')).toBeInTheDocument();
    expect(screen.queryByText('Trending Film')).not.toBeInTheDocument();
    expect(screen.getByText('Action · 35 found')).toBeInTheDocument();
    expect(discoverMovies).toHaveBeenCalledWith({ genre: '28', year: '', minRating: 0 }, 1, expect.anything());
    expect(screen.getByRole('button', { name: /filters \(1 active\)/i })).toBeInTheDocument();
  });

  test('combines genre and year filters', async () => {
    discoverMovies.mockResolvedValue(filtered());
    await renderHome();
    choose(/genre/i, 'Comedy');
    choose(/release year/i, '2010');

    expect(await screen.findByText('Comedy · 2010 · 35 found')).toBeInTheDocument();
    expect(discoverMovies).toHaveBeenLastCalledWith({ genre: '35', year: '2010', minRating: 0 }, 1, expect.anything());
  });

  test('filtered results load more pages on scroll', async () => {
    discoverMovies.mockImplementation((filters, page) => Promise.resolve(filtered(page)));
    await renderHome();
    choose(/release year/i, '2010');
    await screen.findByText('Filtered 1');

    scrollSentinelIntoView();
    expect(await screen.findByText('Filtered 2')).toBeInTheDocument();
    expect(discoverMovies).toHaveBeenLastCalledWith({ genre: '', year: '2010', minRating: 0 }, 2, undefined);
  });

  test('shows a message and a clear button when nothing matches', async () => {
    discoverMovies.mockResolvedValue({ page: 1, total_pages: 0, total_results: 0, results: [] });
    await renderHome();
    choose(/release year/i, '1950');

    expect(await screen.findByText(/no movies match these filters/i)).toBeInTheDocument();

    // Both the panel and the empty state offer "Clear filters"; use the empty state one
    const buttons = screen.getAllByRole('button', { name: /clear filters/i });
    fireEvent.click(buttons[buttons.length - 1]);
    expect(await screen.findByText('Trending Film')).toBeInTheDocument();
  });

  test('filters are hidden while searching', async () => {
    searchMovies.mockResolvedValue({ results: [], page: 1, total_pages: 0, total_results: 0 });
    await renderHome();

    fireEvent.change(screen.getByRole('searchbox', { name: /search movies/i }), { target: { value: 'matrix' } });
    await screen.findByText(/no movies found/i);
    expect(screen.queryByRole('button', { name: /^filters/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('combobox', { name: /genre/i })).not.toBeInTheDocument();
  });

  test('shows an error with retry when filtered movies fail to load', async () => {
    discoverMovies.mockRejectedValueOnce({ response: { status: 500 } }).mockResolvedValueOnce(filtered());
    await renderHome();
    choose(/release year/i, '2010');

    expect(await screen.findByText(/could not load filtered movies/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /retry/i }));
    expect(await screen.findByText('Filtered 1')).toBeInTheDocument();
  });
});
