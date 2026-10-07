import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

beforeEach(() => {
  localStorage.clear();
});

test('renders the app name in the navbar', () => {
  render(<App />);
  expect(screen.getByText(/movie explorer/i)).toBeInTheDocument();
});

test('toggles between light and dark mode and remembers the choice', () => {
  render(<App />);

  // jsdom has no OS colour preference, so the app starts in light mode
  fireEvent.click(screen.getByRole('button', { name: /switch to dark mode/i }));
  expect(screen.getByRole('button', { name: /switch to light mode/i })).toBeInTheDocument();
  expect(JSON.parse(localStorage.getItem('movieExplorer.theme'))).toBe('dark');
});
