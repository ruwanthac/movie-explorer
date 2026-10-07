import { render, screen, fireEvent, within, waitFor, act } from '@testing-library/react';
import App from './App';
import { getTrendingMovies, searchMovies, getMovieDetails } from './api/tmdb';
import { scrollSentinelIntoView } from './testUtils/intersectionObserver';
import { withoutApiKey } from './testUtils/env';

// Replace real network calls with a mock; keep the pure helpers as they are
jest.mock('./api/tmdb', () => ({
  ...jest.requireActual('./api/tmdb'),
  getTrendingMovies: jest.fn(),
  searchMovies: jest.fn(),
  getMovieDetails: jest.fn(),
}));

// Renders the whole app starting at the given URL
const renderAt = (path) => {
  window.history.pushState({}, '', path);
  return render(<App />);
};

// Simulates a returning user who is already signed in
const signIn = (username = 'ruwantha') => {
  localStorage.setItem('movieExplorer.user', JSON.stringify({ username }));
};

beforeEach(() => {
  localStorage.clear();
  // By default the request never resolves, so tests that are not about
  // trending movies are not affected by it
  getTrendingMovies.mockReturnValue(new Promise(() => {}));
  searchMovies.mockReturnValue(new Promise(() => {}));
  getMovieDetails.mockReturnValue(new Promise(() => {}));
});

describe('when signed in', () => {
  beforeEach(() => signIn());

  test('renders the app name in the navbar', () => {
    renderAt('/');
    expect(screen.getByText(/movie explorer/i)).toBeInTheDocument();
  });

  test('toggles between light and dark mode and remembers the choice', () => {
    renderAt('/');

    // jsdom has no OS colour preference, so the app starts in light mode
    fireEvent.click(screen.getByRole('button', { name: /switch to dark mode/i }));
    expect(screen.getByRole('button', { name: /switch to light mode/i })).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem('movieExplorer.theme'))).toBe('dark');
  });

  test('navigates to the favorites page from the navbar', () => {
    renderAt('/');
    fireEvent.click(screen.getByRole('link', { name: /favorites/i }));
    expect(screen.getByRole('heading', { name: /my favorites/i })).toBeInTheDocument();
  });

  test('shows the 404 page for unknown routes', () => {
    renderAt('/does-not-exist');
    expect(screen.getByText(/could not be found/i)).toBeInTheDocument();
  });

  test('redirects away from the login page', () => {
    renderAt('/login');
    expect(screen.queryByRole('heading', { name: /sign in/i })).not.toBeInTheDocument();
    expect(screen.getByText(/discover your favorite films/i)).toBeInTheDocument();
  });

  test('logs out from the account menu', () => {
    renderAt('/');
    fireEvent.click(screen.getByRole('button', { name: /account menu/i }));
    expect(screen.getByText(/signed in as ruwantha/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('menuitem', { name: /logout/i }));
    expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument();
    expect(localStorage.getItem('movieExplorer.user')).toBeNull();
  });
});

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

describe('movie details page', () => {
  beforeEach(() => {
    signIn();
    jest.clearAllMocks();
  });

  const inception = {
    id: 27205,
    title: 'Inception',
    tagline: 'Your mind is the scene of the crime.',
    overview: 'A thief who steals corporate secrets through dream-sharing technology.',
    release_date: '2010-07-15',
    runtime: 148,
    vote_average: 8.369,
    vote_count: 40353,
    poster_path: '/poster.jpg',
    backdrop_path: '/backdrop.jpg',
    genres: [
      { id: 28, name: 'Action' },
      { id: 878, name: 'Science Fiction' },
    ],
    credits: {
      cast: [
        { id: 6193, credit_id: 'a', name: 'Leonardo DiCaprio', character: 'Dom Cobb', profile_path: '/leo.jpg' },
        { id: 24045, credit_id: 'b', name: 'Joseph Gordon-Levitt', character: 'Arthur', profile_path: null },
      ],
    },
    videos: {
      results: [
        { key: 'clip1', site: 'YouTube', type: 'Clip', official: true },
        { key: 'YoHD9XEInc0', site: 'YouTube', type: 'Trailer', official: false },
      ],
    },
  };

  test('shows the full movie information', async () => {
    getMovieDetails.mockResolvedValue(inception);
    renderAt('/movie/27205');

    expect(await screen.findByRole('heading', { level: 1, name: /inception/i })).toBeInTheDocument();
    expect(getMovieDetails).toHaveBeenCalledWith('27205', expect.anything());
    expect(screen.getByText('Your mind is the scene of the crime.')).toBeInTheDocument();
    expect(screen.getByText(/dream-sharing technology/i)).toBeInTheDocument();
    expect(screen.getByText('8.4')).toBeInTheDocument();
    expect(screen.getByText(/40,353 votes/)).toBeInTheDocument();
    expect(screen.getByText('July 15, 2010')).toBeInTheDocument();
    expect(screen.getByText('2h 28m')).toBeInTheDocument();
    expect(screen.getByText('Action')).toBeInTheDocument();
    expect(screen.getByText('Science Fiction')).toBeInTheDocument();
  });

  test('shows the cast with character names', async () => {
    getMovieDetails.mockResolvedValue(inception);
    renderAt('/movie/27205');

    const cast = await screen.findByRole('list', { name: /cast/i });
    expect(cast).toHaveTextContent('Leonardo DiCaprio');
    expect(cast).toHaveTextContent('Dom Cobb');
    expect(cast).toHaveTextContent('Joseph Gordon-Levitt');
  });

  test('links to the YouTube trailer, not a clip', async () => {
    getMovieDetails.mockResolvedValue(inception);
    renderAt('/movie/27205');

    const trailer = await screen.findByRole('link', { name: /watch trailer/i });
    expect(trailer).toHaveAttribute('href', 'https://www.youtube.com/watch?v=YoHD9XEInc0');
    expect(trailer).toHaveAttribute('target', '_blank');
  });

  test('hides the trailer button when there is no trailer', async () => {
    getMovieDetails.mockResolvedValue({ ...inception, videos: { results: [] } });
    renderAt('/movie/27205');

    await screen.findByRole('heading', { level: 1, name: /inception/i });
    expect(screen.queryByRole('link', { name: /watch trailer/i })).not.toBeInTheDocument();
  });

  test('shows "Movie not found" for an id TMDb does not know', async () => {
    getMovieDetails.mockRejectedValue({ response: { status: 404 } });
    renderAt('/movie/999999999');

    expect(await screen.findByRole('heading', { name: /movie not found/i })).toBeInTheDocument();
  });

  test('shows "Movie not found" for a non-numeric id without calling the API', () => {
    renderAt('/movie/abc');

    expect(screen.getByRole('heading', { name: /movie not found/i })).toBeInTheDocument();
    expect(getMovieDetails).not.toHaveBeenCalled();
  });

  test('shows an error with retry when loading fails', async () => {
    getMovieDetails.mockRejectedValueOnce(new Error('Network Error')).mockResolvedValueOnce(inception);
    renderAt('/movie/27205');

    expect(await screen.findByText(/could not load movie details/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /retry/i }));
    expect(await screen.findByRole('heading', { level: 1, name: /inception/i })).toBeInTheDocument();
  });

  test('opens from a movie card and goes back to the list', async () => {
    getTrendingMovies.mockResolvedValue({ results: [inception], page: 1, total_pages: 1 });
    getMovieDetails.mockResolvedValue(inception);
    renderAt('/');

    fireEvent.click(await screen.findByRole('link', { name: /inception/i }));
    expect(await screen.findByRole('heading', { level: 1, name: /inception/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /back/i }));
    expect(await screen.findByRole('heading', { name: /trending this week/i })).toBeInTheDocument();
  });
});

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

describe('status banners', () => {
  beforeEach(() => signIn());

  test('shows an offline banner while the connection is down', () => {
    renderAt('/');
    expect(screen.queryByText(/you're offline/i)).not.toBeInTheDocument();

    act(() => {
      window.dispatchEvent(new Event('offline'));
    });
    expect(screen.getByText(/you're offline/i)).toBeInTheDocument();

    act(() => {
      window.dispatchEvent(new Event('online'));
    });
    expect(screen.queryByText(/you're offline/i)).not.toBeInTheDocument();
  });

  test('warns when the TMDb API key is not configured', () =>
    withoutApiKey(() => {
      renderAt('/');
      expect(screen.getByText(/configuration needed/i)).toBeInTheDocument();
      expect(screen.getByText(/REACT_APP_TMDB_API_KEY/)).toBeInTheDocument();
    }));

  test('error messages explain why a request failed', async () => {
    getTrendingMovies.mockRejectedValue({ response: { status: 429 } });
    renderAt('/');

    expect(
      await screen.findByText('Could not load trending movies. Too many requests. Please wait a moment and try again.')
    ).toBeInTheDocument();
  });
});

describe('when signed out', () => {
  test('redirects protected pages to the login page', () => {
    renderAt('/favorites');
    expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /favorites/i })).not.toBeInTheDocument();
  });

  test('shows validation errors for invalid credentials', () => {
    renderAt('/login');
    fireEvent.click(screen.getByRole('button', { name: /^sign in$/i }));

    expect(screen.getByText(/username is required/i)).toBeInTheDocument();
    expect(screen.getByText(/password is required/i)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'ab' } });
    fireEvent.change(screen.getByLabelText(/^password/i), { target: { value: '123' } });
    fireEvent.click(screen.getByRole('button', { name: /^sign in$/i }));

    expect(screen.getByText(/at least 3 characters/i)).toBeInTheDocument();
    expect(screen.getByText(/at least 6 characters/i)).toBeInTheDocument();
  });

  test('signs in and returns to the page originally requested', () => {
    renderAt('/favorites');

    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'ruwantha' } });
    fireEvent.change(screen.getByLabelText(/^password/i), { target: { value: 'secret123' } });
    fireEvent.click(screen.getByRole('button', { name: /^sign in$/i }));

    expect(screen.getByRole('heading', { name: /my favorites/i })).toBeInTheDocument();
    // Only the username is stored, never the password
    expect(JSON.parse(localStorage.getItem('movieExplorer.user'))).toEqual({ username: 'ruwantha' });
  });

  test('toggles password visibility', () => {
    renderAt('/login');
    const passwordInput = screen.getByLabelText(/^password/i);
    expect(passwordInput).toHaveAttribute('type', 'password');

    fireEvent.click(screen.getByRole('button', { name: /show password/i }));
    expect(passwordInput).toHaveAttribute('type', 'text');
  });
});
