import { render, screen } from '@testing-library/react';
import ErrorBoundary from './ErrorBoundary';

const Broken = () => {
  throw new Error('Boom');
};

test('shows a friendly page instead of crashing', () => {
  // React logs caught errors; keep the test output clean
  const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

  render(
    <ErrorBoundary>
      <Broken />
    </ErrorBoundary>
  );

  expect(screen.getByRole('heading', { name: /something went wrong/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /reload page/i })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /go to home/i })).toHaveAttribute('href', '/');

  consoleError.mockRestore();
});

test('renders children normally when there is no error', () => {
  render(
    <ErrorBoundary>
      <p>All good</p>
    </ErrorBoundary>
  );
  expect(screen.getByText('All good')).toBeInTheDocument();
});
