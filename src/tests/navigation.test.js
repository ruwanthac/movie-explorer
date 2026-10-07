import { screen, fireEvent } from '@testing-library/react';
import { renderAt, signIn, resetAppState } from '../testUtils/app';

jest.mock('../api/tmdb', () => require('../testUtils/tmdbMock').createTmdbMock());

beforeEach(resetAppState);

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
