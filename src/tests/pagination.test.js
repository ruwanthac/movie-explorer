import { screen, fireEvent } from '@testing-library/react';
import { getTrendingMovies, searchMovies } from '../api/tmdb';
import { renderAt, signIn, resetAppState } from '../testUtils/app';
import { scrollSentinelIntoView } from '../testUtils/intersectionObserver';

jest.mock('../api/tmdb', () => require('../testUtils/tmdbMock').createTmdbMock());

beforeEach(resetAppState);

describe('loading more movies', () => {
  beforeEach(() => {
    signIn();
    jest.clearAllMocks();
  });

  // Builds a fake TMDb page with 2 movies, e.g. page 1 -> ids 11, 12
  const trendingPage = (page, totalPages = 3) => ({
    page,
    total_pages: totalPages,
    results: [1, 2].map((n) => ({ id: page * 10 + n, title: `Movie ${page * 10 + n}`, release_date: '2024-01-01', vote_average: 7 })),
  });

  test('loads the next page when scrolling to the bottom (default mode)', async () => {
    getTrendingMovies.mockImplementation((page) => Promise.resolve(trendingPage(page)));
    renderAt('/');
    await screen.findByText('Movie 12');

    scrollSentinelIntoView();

    expect(await screen.findByText('Movie 22')).toBeInTheDocument();
    expect(screen.getByText('Movie 11')).toBeInTheDocument(); // earlier results are kept
    expect(getTrendingMovies).toHaveBeenLastCalledWith(2, undefined); // no cancel signal for later pages
  });

  test('loads the next page of search results on scroll', async () => {
    getTrendingMovies.mockReturnValue(new Promise(() => {}));
    searchMovies.mockImplementation((query, page) =>
      Promise.resolve({ ...trendingPage(page), total_results: 6 })
    );
    localStorage.setItem('movieExplorer.lastSearch', JSON.stringify('movie'));
    renderAt('/');
    await screen.findByText('Movie 12');

    scrollSentinelIntoView();

    expect(await screen.findByText('Movie 22')).toBeInTheDocument();
    expect(searchMovies).toHaveBeenLastCalledWith('movie', 2, undefined);
  });

  test('uses a Load More button when that mode is selected and remembers it', async () => {
    getTrendingMovies.mockImplementation((page) => Promise.resolve(trendingPage(page)));
    renderAt('/');
    await screen.findByText('Movie 12');

    fireEvent.click(screen.getByRole('button', { name: /load more button/i }));
    expect(screen.queryByTestId('infinite-scroll-sentinel')).not.toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem('movieExplorer.paginationMode'))).toBe('button');

    fireEvent.click(screen.getByRole('button', { name: /^load more$/i }));
    expect(await screen.findByText('Movie 22')).toBeInTheDocument();
  });

  test('stops loading at the last page', async () => {
    getTrendingMovies.mockImplementation((page) => Promise.resolve(trendingPage(page, 2)));
    renderAt('/');
    await screen.findByText('Movie 12');

    scrollSentinelIntoView();
    await screen.findByText('Movie 22');

    expect(screen.getByText(/you've reached the end/i)).toBeInTheDocument();
    expect(screen.queryByTestId('infinite-scroll-sentinel')).not.toBeInTheDocument();
  });

  test('keeps loaded movies and offers a retry when a later page fails', async () => {
    getTrendingMovies
      .mockResolvedValueOnce(trendingPage(1))
      .mockRejectedValueOnce(new Error('Network Error'))
      .mockResolvedValueOnce(trendingPage(2));
    renderAt('/');
    await screen.findByText('Movie 12');

    scrollSentinelIntoView();
    expect(await screen.findByText(/could not load trending movies/i)).toBeInTheDocument();
    expect(screen.getByText('Movie 11')).toBeInTheDocument();

    // Scrolling again does not repeat the failed request automatically
    scrollSentinelIntoView();
    expect(getTrendingMovies).toHaveBeenCalledTimes(2);

    fireEvent.click(screen.getByRole('button', { name: /retry/i }));
    expect(await screen.findByText('Movie 22')).toBeInTheDocument();
    expect(getTrendingMovies).toHaveBeenLastCalledWith(2, undefined); // no cancel signal for later pages
  });
});
