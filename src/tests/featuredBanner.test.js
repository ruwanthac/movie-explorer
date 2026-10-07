import { screen, fireEvent, within } from '@testing-library/react';
import { getTrendingMovies, getMovieDetails, searchMovies } from '../api/tmdb';
import { renderAt, signIn, resetAppState } from '../testUtils/app';

jest.mock('../api/tmdb', () => require('../testUtils/tmdbMock').createTmdbMock());

beforeEach(resetAppState);

describe('featured banner', () => {
  const topMovie = {
    id: 1,
    title: 'Top Movie',
    overview: 'The most popular film this week.',
    release_date: '2026-05-01',
    vote_average: 8.2,
    poster_path: '/top.jpg',
    backdrop_path: '/top-backdrop.jpg',
  };
  const otherMovie = { id: 2, title: 'Other Movie', release_date: '2026-01-01', vote_average: 7, backdrop_path: '/b.jpg' };

  beforeEach(() => {
    signIn();
    getTrendingMovies.mockResolvedValue({ results: [topMovie, otherMovie], page: 1, total_pages: 1 });
  });

  const banner = () => screen.findByRole('region', { name: 'Top Movie' });

  test('features the #1 trending movie with its rating, year and overview', async () => {
    renderAt('/');

    const featured = await banner();
    expect(within(featured).getByText(/#1 trending this week/i)).toBeInTheDocument();
    expect(within(featured).getByText('8.2')).toBeInTheDocument();
    expect(within(featured).getByText('2026')).toBeInTheDocument();
    expect(within(featured).getByText(/most popular film this week/i)).toBeInTheDocument();
    expect(within(featured).getByRole('link', { name: /more info/i })).toHaveAttribute('href', '/movie/1');
  });

  test('plays the trailer once the movie details have loaded', async () => {
    getMovieDetails.mockResolvedValue({
      ...topMovie,
      videos: { results: [{ key: 'trailer123', site: 'YouTube', type: 'Trailer', official: true, name: 'Official Trailer' }] },
    });
    renderAt('/');

    const featured = await banner();
    expect(getMovieDetails).toHaveBeenCalledWith('1', expect.anything());
    fireEvent.click(await within(featured).findByRole('button', { name: /watch trailer/i }));

    const dialog = screen.getByRole('dialog', { name: /top movie/i });
    expect(within(dialog).getByTitle('Top Movie trailer')).toHaveAttribute(
      'src',
      expect.stringContaining('embed/trailer123')
    );
  });

  test('hides the trailer button when the movie has no trailer', async () => {
    getMovieDetails.mockResolvedValue({ ...topMovie, videos: { results: [] } });
    renderAt('/');

    const featured = await banner();
    await within(featured).findByRole('link', { name: /more info/i });
    expect(within(featured).queryByRole('button', { name: /watch trailer/i })).not.toBeInTheDocument();
  });

  test('is hidden while searching', async () => {
    searchMovies.mockResolvedValue({ results: [], page: 1, total_pages: 0, total_results: 0 });
    renderAt('/');
    await banner();

    fireEvent.change(screen.getByRole('searchbox', { name: /search movies/i }), { target: { value: 'matrix' } });
    await screen.findByText(/no movies found/i);
    expect(screen.queryByRole('region', { name: 'Top Movie' })).not.toBeInTheDocument();
  });

  test('is skipped when the top movie has no backdrop image', async () => {
    getTrendingMovies.mockResolvedValue({
      results: [{ ...topMovie, backdrop_path: null }],
      page: 1,
      total_pages: 1,
    });
    renderAt('/');

    await screen.findByRole('heading', { level: 3, name: 'Top Movie' });
    expect(screen.queryByRole('region', { name: 'Top Movie' })).not.toBeInTheDocument();
  });
});
