import { screen, waitFor } from '@testing-library/react';
import { getTrendingMovies } from '../api/tmdb';
import { renderAt, resetAppState } from '../testUtils/app';

jest.mock('../api/tmdb', () => require('../testUtils/tmdbMock').createTmdbMock());

beforeEach(resetAppState);

test('shows trending posters behind the login form as hidden decoration', async () => {
  getTrendingMovies.mockResolvedValue({
    results: [
      { id: 1, title: 'With Poster', poster_path: '/a.jpg' },
      { id: 2, title: 'No Poster', poster_path: null },
    ],
    page: 1,
    total_pages: 1,
  });
  const { container } = renderAt('/login');

  expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument();

  await waitFor(() => expect(container.querySelectorAll('img[src$="/a.jpg"]')).toHaveLength(1));
  const poster = container.querySelector('img[src$="/a.jpg"]');

  // Decorative only: hidden from screen readers, and movies without a poster are skipped
  expect(poster.closest('[aria-hidden="true"]')).not.toBeNull();
  expect(screen.queryByRole('img', { name: /with poster/i })).not.toBeInTheDocument();
});

test('still shows the login form when posters fail to load', async () => {
  getTrendingMovies.mockRejectedValue(new Error('Network Error'));
  renderAt('/login');

  expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument();
  await waitFor(() => expect(getTrendingMovies).toHaveBeenCalled());
  expect(screen.getByRole('button', { name: /^sign in$/i })).toBeEnabled();
});
