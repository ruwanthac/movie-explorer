import { screen, fireEvent, within, waitFor } from '@testing-library/react';
import { getTrendingMovies, getMovieDetails } from '../api/tmdb';
import { renderAt, signIn, resetAppState } from '../testUtils/app';

jest.mock('../api/tmdb', () => require('../testUtils/tmdbMock').createTmdbMock());

beforeEach(resetAppState);

describe('favorites', () => {
  beforeEach(() => {
    signIn();
    jest.clearAllMocks();
  });

  const inception = { id: 27205, title: 'Inception', release_date: '2010-07-15', vote_average: 8.4, poster_path: '/p.jpg' };
  const matrix = { id: 603, title: 'The Matrix', release_date: '1999-03-30', vote_average: 8.2, poster_path: '/m.jpg' };

  const savedFavorites = () => JSON.parse(localStorage.getItem('movieExplorer.favorites'));
  const favoritesLink = () => screen.getByRole('link', { name: /favorites/i });

  test('adds and removes a favorite from a movie card', async () => {
    getTrendingMovies.mockResolvedValue({ results: [inception, matrix], page: 1, total_pages: 1 });
    renderAt('/');

    fireEvent.click(await screen.findByRole('button', { name: /add inception to favorites/i }));

    // Clicking the heart does not open the movie
    expect(screen.getByRole('heading', { name: /trending this week/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /remove inception from favorites/i })).toHaveAttribute('aria-pressed', 'true');
    expect(await screen.findByText(/added "inception" to favorites/i)).toBeInTheDocument();
    expect(favoritesLink()).toHaveTextContent('1');
    expect(savedFavorites()).toEqual([inception]);

    fireEvent.click(screen.getByRole('button', { name: /remove inception from favorites/i }));
    expect(await screen.findByText(/removed "inception" from favorites/i)).toBeInTheDocument();
    expect(savedFavorites()).toEqual([]);
  });

  test('adds a favorite from the details page', async () => {
    getMovieDetails.mockResolvedValue({ ...inception, genres: [], credits: { cast: [] }, videos: { results: [] } });
    renderAt('/movie/27205');

    fireEvent.click(await screen.findByRole('button', { name: /add inception to favorites/i }));
    expect(screen.getByRole('button', { name: /remove inception from favorites/i })).toHaveTextContent(/in favorites/i);
    // Only the fields needed for a card are saved
    expect(savedFavorites()).toEqual([inception]);
  });

  test('lists saved favorites, newest first, and keeps them after reload', () => {
    localStorage.setItem('movieExplorer.favorites', JSON.stringify([matrix, inception]));
    renderAt('/favorites');

    expect(screen.getByText('(2 movies)')).toBeInTheDocument();
    const titles = screen.getAllByRole('heading', { level: 3 }).map((heading) => heading.textContent);
    expect(titles).toEqual(['The Matrix', 'Inception']);
    expect(favoritesLink()).toHaveTextContent('2');
  });

  test('removing a movie on the favorites page takes it off the list', () => {
    localStorage.setItem('movieExplorer.favorites', JSON.stringify([matrix, inception]));
    renderAt('/favorites');

    fireEvent.click(screen.getByRole('button', { name: /remove the matrix from favorites/i }));
    expect(screen.queryByText('The Matrix')).not.toBeInTheDocument();
    expect(screen.getByText('(1 movie)')).toBeInTheDocument();
  });

  test('clears all favorites after confirming', async () => {
    localStorage.setItem('movieExplorer.favorites', JSON.stringify([matrix, inception]));
    renderAt('/favorites');

    fireEvent.click(screen.getByRole('button', { name: /clear all/i }));
    const dialog = screen.getByRole('dialog', { name: /remove all favorites/i });

    // Cancel keeps everything
    fireEvent.click(within(dialog).getByRole('button', { name: /cancel/i }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(screen.getByText('Inception')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /clear all/i }));
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: /remove all/i }));

    expect(await screen.findByText(/no favorites yet/i)).toBeInTheDocument();
    expect(savedFavorites()).toEqual([]);
  });

  test('shows an empty state with a link to discover movies', () => {
    renderAt('/favorites');

    expect(screen.getByText(/no favorites yet/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /discover movies/i })).toHaveAttribute('href', '/');
  });
});
