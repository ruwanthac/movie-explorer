import { screen, fireEvent } from '@testing-library/react';
import { getTrendingMovies } from '../api/tmdb';
import { renderAt, signIn, resetAppState } from '../testUtils/app';

jest.mock('../api/tmdb', () => require('../testUtils/tmdbMock').createTmdbMock());

beforeEach(resetAppState);

describe('trending movies', () => {
  beforeEach(() => signIn());

  const movies = [
    { id: 1, title: 'Inception', release_date: '2010-07-16', vote_average: 8.37, poster_path: '/inception.jpg' },
    { id: 2, title: 'No Poster Movie', release_date: '', vote_average: 0, poster_path: null },
  ];

  test('shows trending movies with title, year and rating', async () => {
    getTrendingMovies.mockResolvedValue({ results: movies, page: 1, total_pages: 5 });
    renderAt('/');

    expect(await screen.findByRole('heading', { name: 'Inception' })).toBeInTheDocument();
    expect(screen.getByText('2010')).toBeInTheDocument();
    expect(screen.getByLabelText('Rating 8.4')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /inception/i })).toHaveAttribute('href', '/movie/1');
  });

  test('handles movies without a poster, date or rating', async () => {
    getTrendingMovies.mockResolvedValue({ results: movies, page: 1, total_pages: 5 });
    renderAt('/');

    expect(await screen.findByRole('img', { name: /no poster movie has no poster/i })).toBeInTheDocument();
    expect(screen.getByText('N/A')).toBeInTheDocument();
    expect(screen.getByLabelText('Rating NR')).toBeInTheDocument();
  });

  test('shows an error with a retry button when the request fails', async () => {
    getTrendingMovies.mockRejectedValueOnce(new Error('Network Error'));
    renderAt('/');

    expect(await screen.findByText(/could not load trending movies/i)).toBeInTheDocument();

    getTrendingMovies.mockResolvedValueOnce({ results: movies, page: 1, total_pages: 5 });
    fireEvent.click(screen.getByRole('button', { name: /retry/i }));
    expect(await screen.findByRole('heading', { name: 'Inception' })).toBeInTheDocument();
  });
});
