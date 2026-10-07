import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

// Renders the whole app starting at the given URL
const renderAt = (path) => {
  window.history.pushState({}, '', path);
  return render(<App />);
};

beforeEach(() => {
  localStorage.clear();
});

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

test('renders the login page without the navbar', () => {
  renderAt('/login');
  expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument();
  expect(screen.queryByText(/movie explorer/i)).not.toBeInTheDocument();
});
