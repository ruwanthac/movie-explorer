import { screen, fireEvent } from '@testing-library/react';
import { renderAt, resetAppState } from '../testUtils/app';

jest.mock('../api/tmdb', () => require('../testUtils/tmdbMock').createTmdbMock());

beforeEach(resetAppState);

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
