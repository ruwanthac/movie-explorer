import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';
import { getTrendingMovies } from './api/tmdb';

// Replace real network calls with a mock; keep the pure helpers as they are
jest.mock('./api/tmdb', () => ({
  ...jest.requireActual('./api/tmdb'),
  getTrendingMovies: jest.fn(),
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
