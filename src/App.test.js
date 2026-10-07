import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';
import { getTrendingMovies, searchMovies } from './api/tmdb';

// Replace real network calls with a mock; keep the pure helpers as they are
jest.mock('./api/tmdb', () => ({
  ...jest.requireActual('./api/tmdb'),
  getTrendingMovies: jest.fn(),
  searchMovies: jest.fn(),
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

  test('shows the movie id on the details route', () => {
    renderAt('/movie/550');
    expect(screen.getByRole('heading', { name: /movie details #550/i })).toBeInTheDocument();
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
